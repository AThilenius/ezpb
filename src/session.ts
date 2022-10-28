import Long from 'long';
import { channel } from './channels/buffered_channel';
import { ChannelSender } from './channels/channel_interfaces';
import { Exchange } from './exchange';
import { ServiceScope } from './proto_gen_api';
import { ServiceHandlerDispatch } from './rpc/service_handler_dispatch';
import {
  Code,
  errorMessage,
  isErrorMessage,
  StatusError,
  Transport,
  TransportMessage,
} from './transport';
import { BufferedEvent } from './utils/buffered_event';
import { ezpbLog } from './utils/log';
import { LongMap } from './utils/long_map';
import { isZero } from './utils/number';

export const EXCHANGE_CLOSED = new StatusError(
  Code.FailedPrecondition,
  'exchange closed'
);
const EXCHANGE_REJECTED = new StatusError(Code.Internal, 'exchange rejected');

/**
 * A session owns all per-peer connection, dispatch, and exchange data. A
 * 'session' in concept is a single conversation between exactly two peers (us
 * and a remote), and many topics (exchanges) can be had during a single
 * session.
 *
 * Unlike Maglev, sessions are non-resumable. This was done to drastically
 * reduce the complexity of Ezpb, as session-rejoining necessitates a custom
 * reliability and retransmission layer with complex caching policies. So a
 * `Session` in Ezpb a stripped-down union of both `NodeRef` and `Session` from
 * Maglev.
 */
export class Session implements ServiceScope {
  public serviceHandlerDispatch: ServiceHandlerDispatch;
  private readonly exchanges = new LongMap<Exchange>();
  private nextExchangeId: number;

  constructor(
    parentScope: ServiceHandlerDispatch,
    private readonly transport: Transport,
    private readonly firstExchangeId: number
  ) {
    this.serviceHandlerDispatch = new ServiceHandlerDispatch(parentScope);
    this.nextExchangeId = this.firstExchangeId;
  }

  private async handleInboundTrafficFromWire() {
    const [_, wireReceiver] = this.transport.ioChannel;

    for await (const item of wireReceiver) {
      // If the transport closed (websocket disconnect), fail all exchanges.
      // This is an ungraceful failure.
      if (item.err) {
        this.failAllExchanges(item.err);
        return;
      }

      // Exchange IDs must always be set.
      const { exchangeId, exchangeType } = item.msg.header;
      if (!exchangeId || isZero(exchangeId)) {
        this.failAllExchanges(
          new Error('Invalid exchange ID found in header: ' + exchangeId)
        );
        return;
      }

      const exchange = this.exchanges.get(exchangeId);

      if (exchange) {
        // Handle incoming message to existing exchange.
        exchange.processWireMessage(item.msg);
      } else if (item.msg.header.exchangeType) {
        // TODO: Exchange middleware needs to be called here...
        const exchange = Exchange.fromInboundMsg(
          item.msg,
          this.transport.ioChannel[0]
        );

        // TODO: Nope
        this.transport.ioChannel[0].send(
          errorMessage(EXCHANGE_REJECTED, { exchangeId })
        );
      } else {
        this.failAllExchanges(
          new Error(
            `Fatal error ${item.msg.header.error?.code}: ${item.msg.header.error?.message}`
          )
        );
        return;
      }
    }
  }

  private failAllExchanges(err: Error) {
    for (const [_, exchange] of this.exchanges) {
      exchange.close(err);
    }
  }

  public createExchange(
    exchangeType: string,
    initialPayload: Uint8Array | null
  ): Exchange {
    const exchangeId = Long.fromNumber(this.nextExchangeId, true);
    this.nextExchangeId += 2;
    const exchange = Exchange.fromOutboundCall(
      exchangeId,
      exchangeType,
      initialPayload,
      this.transport.ioChannel[0]
    );
    this.exchanges.set(exchangeId, exchange);
    exchange.exchangeCompleteEvent.addHandler(() => {
      if (Object.is(this.exchanges.get(exchangeId), exchange)) {
        this.exchanges.delete(exchangeId);
      }
    });
    return exchange;
  }

  private outboundLoopStarted = false;

  private async outboundLoop() {
    if (this.outboundLoopStarted) {
      return;
    }
    this.outboundLoopStarted = true;
    try {
      for await (const { msg, err } of this.exchangesChannel[1]) {
        if (err || !msg) {
          if (err !== SESSION_RESET) {
            ezpbLog.child('session').error(err);
          }
          break;
        }
        await this.sendMessage(msg);
      }
    } catch (err) {
      ezpbLog.child('session').error(err);
      // TODO: close session?
    }
  }

  private async sendMessage(msg: TransportMessage) {
    msg.header = {
      ...msg.header,
      srcNodeId: this.nodeId,
      destNodeId: this.peerNodeId,
      sessionId: this.sessionId,
    };
    this.wireSender.send(msg);
  }
}
