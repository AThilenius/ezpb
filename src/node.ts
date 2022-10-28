import { Channel } from './channels/channel_interfaces';
import { ServiceScope } from './proto_gen_api';
import { ServiceHandlerDispatch } from './rpc/service_handler_dispatch';
import { Transport } from './transport';

export interface Exchange {
  /**
   * The channel used by the RPC client/host to read/write messages into an
   * exchange. This is only the payload part of an ezpb message, the header
   * has already been stripped off at this point.
   */
  channel: Channel<Uint8Array>;

  /**
   * The type (as set in the header) of the exchange.
   */
  exchangeType: string;
}

export class Node implements ServiceScope {
  public serviceHandlerDispatch: ServiceHandlerDispatch;

  public constructor(
    public readonly transport: Transport,
    public readonly authHandler: (token: string, method) =>
    parentServiceHandlerDispatch: ServiceHandlerDispatch
  ) {
    this.serviceHandlerDispatch = new ServiceHandlerDispatch(
      parentServiceHandlerDispatch
    );

    void this.dispatchTransportLoop();
  }

  public createExchangeChannel(): Channel<Uint8Array> {
    // TODO
    return null as any;
  }

  private async dispatchTransportLoop() {
    const [_, receiver] = this.transport.ioChannel;

    for await (const msg of receiver) {
      if (msg.err) {
        // ...
      }
    }
  }
}
