import { forward } from '../channels/forward';
import { map } from '../channels/map';
import { Node } from '../node';
import { ChannelReceiver } from '../channels/channel_interfaces';
import { takeOne } from '../channels/take_one';
import { sanitizeProtoFullName, toCamelCase } from '../utils/string';
import { protoRoot } from './proto_registry';
import { promisedReceiver } from '../channels/promise';

export function synthesizeClient<T = any>(serviceName: string, Node: Node): T {
  const client: any = {};
  const service = protoRoot.lookupService(serviceName);
  for (const methodName of Object.keys(service.methods)) {
    const protoMethod = service.methods[methodName];
    const fullMethodName = sanitizeProtoFullName(protoMethod.fullName);
    const handlerFunctionName = toCamelCase(methodName);
    client[handlerFunctionName] = synthesizeMethod(
      protoMethod,
      fullMethodName,
      Node
    );
  }
  return client;
}

export interface CallOptions {
  connectTimeoutMs?: number;
}

export function synthesizeMethod(
  method: protobuf.Method,
  methodName: string,
  node: Node
): (arg: any, callOptions?: CallOptions) => any {
  const reqType = protoRoot.lookupType(method.requestType);
  const resType = protoRoot.lookupType(method.responseType);

  return (arg: any, callOptions?: CallOptions): any => {
    const responseReceiverPromise = (async () => {
      const [sender, receiver] = node.createExchangeChannel();

      // Logic is significantly different for unary vs streamed requests.
      if (method.requestStream) {
        // The input arg is an ChannelReceiver. We can simply map the object
        // through the protobuf encoder, and forward it to the exchange.
        const channel = arg as ChannelReceiver<any>;
        let sent = false;
        forward(
          map(channel, (msg) => {
            sent = true;
            return reqType.encode(msg).finish();
          }),
          sender
        );

        // We also open the send channel after 1 event loop if no other traffic
        // was sent over the channel. This has the effect of invoking the RPC
        // on the other end with an empty channel.
        setTimeout(() => {
          if (sent || channel.isDone) {
            return;
          }

          sender.open();
        }, 0);
      } else {
        // The input arg is an object. Encode it, send it and close the exchange
        sender.sendAndClose(reqType.encode(arg).finish());
      }
      return receiver;
    })();

    const respReceiver = promisedReceiver(responseReceiverPromise);
    if (method.responseStream) {
      // If the response (from the remote) is streamed then we simply map it
      // from through the protobuf decoder.
      return map(respReceiver, (msg) =>
        resType.toObject(resType.decode(msg), { defaults: true })
      );
    } else {
      // Otherwise we wait for the first (and only) response and return that.
      return takeOne(respReceiver).then((data) =>
        resType.toObject(resType.decode(data), { defaults: true })
      );
    }
  };
}
