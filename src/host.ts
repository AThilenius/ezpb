import { ReflectionObject } from 'protobufjs';
import { Channel } from './channels/channel_interfaces';
import { ServiceHandlerDispatch } from './rpc/service_handler_dispatch';
import { Exchange, Transport, TransportMessage } from './transport';
import { ServiceScope } from './proto_gen_api';
import { WebSocketServer } from 'ws';
import http from 'http';
import { channelFromWebsocket } from './utils/ws';
import { wlabs } from './gen/proto_gen';
import { map } from './channels/map';
import { channel } from './channels/buffered_channel';
import { ProtoMethodInfo } from './rpc/proto_registry';

export interface HostContext {
  websocket: WebSocket;
  protoMethodInfo: ProtoMethodInfo;
}

export interface HostOptions<TCtx extends HostContext> {
  server: http.Server;
  path?: string;
  middleware?: ((channel: Channel<[TCtx, any]>) => Channel<[TCtx, any]>)[];
}

export class Host<TCtx extends HostContext> implements ServiceScope {
  public serviceHandlerDispatch = new ServiceHandlerDispatch();

  private constructor(private readonly options: HostOptions<TCtx>) {}

  public static create<TCtx extends HostContext>(
    options: HostOptions<TCtx>
  ): Host<TCtx> {
    // Control message handlers
    const wss = new WebSocketServer({
      server: options.server,
      path: options.path || '/',
    });

    // TODO: Keep an LRU of sockets, and close the least recently used when the
    // number of connections grows past MAX_ACTIVE_WEBSOCKETS.
    wss.on('connection', async (ws) => {
      const transport = new Transport(ws as any);
      const exchanges = new Map<number, Exchange>();

      (async () => {
        const [msgSender, msgReceiver] = transport.ioChannel;
        for await (const msg of msgReceiver) {
          if (msg.err) {
            // TODO: Unsure what exactly to do here.
            ws.close();
          }

          msg.msg?.header.exchangeType;
        }
      })();

      // Send the channel through all the middlewares, if any.
      let channel = map(transport.ioChannel[1], (msg) => []);

      for (const middleware of options.middleware || []) {
        channel = middleware(channel);
      }
    });

    return new Host(options);
  }
}

export interface HostCallContext {
  headers: Headers;
  websocket: WebSocket;
  channel: Channel<TransportMessage>;
  methodInfo: MethodInfo;
}
