import Long from 'long';
import { biChannel } from './channels/buffered_channel';
import { Channel, ChannelSender } from './channels/channel_interfaces';
import {
  Code,
  errorMessage,
  isErrorMessage,
  StatusError,
  TransportMessage,
} from './transport';
import { BufferedEvent } from './utils/buffered_event';
import { isZero, toNumber } from './utils/number';

type ExchangeDirection = 'recv' | 'send';

export class Exchange {
  /**
   * The channel the client using this class sends and receives payloads over.
   */
  public readonly channel: Channel<Uint8Array>;

  /**
   * Fires when the exchange has finished processing all inbound and outbound
   * messages (including e.g. retransmissions)
   */
  public readonly exchangeCompleteEvent = new BufferedEvent<Error | null>();

  /**
   * The complement of `channel` for internal reading/writing and dispatching.
   */
  private readonly clientChannel: Channel<Uint8Array>;

  private isClosed = false;
  private error?: Error;

  private constructor(
    public readonly exchangeId: Long | number,
    public readonly exchangeType: string,

    /**
     * Channel used to read/write data cross the wire. A `Connection` provides
     * this channel, and will fail it if the connection times out.
     */
    private readonly wireSender: ChannelSender<TransportMessage>
  ) {
    [this.channel, this.clientChannel] = biChannel();
    void this.outboundLoop();
  }

  public static fromInboundMsg(
    msg: TransportMessage,
    wireSender: ChannelSender<TransportMessage>
  ): Exchange {
    const exchange = new Exchange(
      msg.header.exchangeId!,
      msg.header.exchangeType!,
      wireSender
    );

    exchange.processWireMessage(msg);
    return exchange;
  }

  public static fromOutboundCall(
    exchangeId: Long | number,
    exchangeType: string,
    wireSender: ChannelSender<TransportMessage>
  ): Exchange {
    const exchange = new Exchange(exchangeId, exchangeType, wireSender);
    // TODO
    wireSender.send(...)
    return exchange;
  }

  /** Process a message from the wire. */
  public processWireMessage(msg: TransportMessage) {
    if (msg.header.error) {
      this.close(
        new Error(`Code ${msg.header.error.code}: ${msg.header.error.message}`)
      );
      return;
    }

    const [sender] = this.clientChannel;

    // No payload messages are sent to either open or close a streaming
    // exchange, without providing a payload. They are different from a null
    // payload, in that a null payload is still delivered to the streaming RPC
    // as a 'default value' message.
    const hasPayload = !msg.header.noPayload;
    const isFinal = !msg.header.exchangeContinues;
    if (hasPayload && isFinal) {
      sender.sendAndClose(msg.payload!);
    } else if (hasPayload) {
      sender.send(msg.payload!);
    } else if (isFinal) {
      sender.close();
    }
  }

  /** Close the exchange. Notifies the peer that the exchange ws closed. */
  public close(err?: Error) {
    if (this.isClosed) {
      return;
    }
    this.isClosed = true;
    this.error = err;

    // Close/fail channels
    if (err) {
      this.clientChannel[0].fail(err);
      this.clientChannel[1].fail(err);
    } else {
      this.clientChannel[0].close();
    }

    // TODO
  }
}
