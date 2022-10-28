import protobuf from 'protobufjs';
import { BufferedChannel } from '../channels/buffered_channel';
import { ChannelReceiver } from '../channels/channel_interfaces';
import { forward } from '../channels/forward';
import { map } from '../channels/map';
import { takeOne } from '../channels/take_one';
import { Exchange } from '../transport';
import { sanitizeProtoFullName, toCamelCase } from '../utils/string';
import { protoRoot } from './proto_registry';

/**
 * A bespoke v-table and call dispatch implementation specificity for service
 * handler overriding.
 */
export class ServiceHandlerDispatch {
  /**
   * A map of qualified method names to a stack of handlers. The first handler
   * in the array is the 'active' handler.
   */
  private vTable = new Map<string, CallableFunction[]>();

  constructor(
    /**
     * An optional parent to forward calls to if they cannot be resolved with
     * this v-table.
     */
    private parent?: ServiceHandlerDispatch
  ) {}

  public async dispatch(exchange: Exchange, callContext: CallContext) {
    const [sender, receiver] = exchange.channel;
    const methodInfo = this.vTable.get(exchange.exchangeType);

    if (!methodInfo || methodInfo.callables.length === 0) {
      // Try sending it to the parent, if any.
      if (this.parent) {
        await this.parent.dispatch(exchange, callContext);
        return;
      } else {
        sender.fail(
          new Error(`${exchange.exchangeType} has no registered handler`)
        );
        return;
      }
    }

    // If the request is streamed we just map the exchange stream into the
    // protos it's expecting in and pass it along. If it's unary we grab the
    // first
    const reqObj = methodInfo.protoMethod.requestStream
      ? map(receiver, (data) =>
          methodInfo.protoReqType.toObject(
            methodInfo.protoReqType.decode(data),
            { defaults: true }
          )
        )
      : methodInfo.protoReqType.toObject(
          methodInfo.protoReqType.decode(await takeOne(receiver)),
          { defaults: true }
        );

    // Invoke the handler. Note that we await the returned object
    // unconditionally here. That's because if it's a promise, it will be
    // awaited and if it isn't, it will just be passed through.
    const returnedObj = await methodInfo.callables[0](reqObj, callContext);
    const encodeRes = (value: any) =>
      methodInfo.protoResType
        .encode(methodInfo.protoResType.fromObject(value))
        .finish();

    try {
      if (methodInfo.protoMethod.responseStream) {
        // If the response is streamed then either an ChannelReceiver or an
        // AsyncGenerator should have been returned.

        // TODO: Checking if it's a BufferedChannel is technically incorrect as
        // channels are defined by an interface.
        if (returnedObj instanceof BufferedChannel) {
          // We can just make it to ezpbMessages and forward it directly to
          // the exchange sender.
          forward(
            map(returnedObj as ChannelReceiver<any>, (value) =>
              encodeRes(value)
            ),
            sender
          );
        } else {
          // Hopefully an AsyncGenerator. Same as above, we just do the
          // forwarding manually.
          const iter = returnedObj as AsyncGenerator<any>;
          while (true) {
            const { value, done } = await iter.next();
            if (done) {
              if (value) {
                // Value is only set for the "return" value of an async
                // generator. So it's most likely undefined.
                sender.sendAndClose(encodeRes(value));
              } else {
                sender.close();
              }
              break;
            } else {
              sender.send(encodeRes(value));
            }
          }
        }
      } else {
        // Response is not streamed, it's unary.
        sender.sendAndClose(encodeRes(returnedObj));
      }
    } catch (e: any) {
      sender.fail(e);
    }
  }

  public registerHandler(serviceName: string, serviceHandler: any): () => void {
    // Lookup the service method names from the proto.
    const service = protoRoot.lookupService(serviceName);
    let unregister = () => {};
    for (const methodName of Object.keys(service.methods)) {
      const protoMethod = service.methods[methodName];
      const fullMethodName = sanitizeProtoFullName(protoMethod.fullName);
      const handlerFunctionName = toCamelCase(methodName);

      let methodInfo = this.vTable.get(fullMethodName);

      if (!serviceHandler[handlerFunctionName]) {
        // Service handlers can be partial, so skip missing method impls.
        continue;
      }

      const callable = serviceHandler[handlerFunctionName];

      // If the value isn't a function, then we need to throw.
      if (typeof callable !== 'function') {
        throw new Error(
          `Handler obj has member ${handlerFunctionName} but it isn't a function`
        );
      }

      // The callable needs to be bound to the original handler object,
      // otherwise things like class methods won't work. Because JS is
      // statically scoped. Except when it isn't. -big eye roll-
      const boundCallable = callable.bind(serviceHandler);

      const protoReqType = protoRoot.lookupType(protoMethod.requestType);
      const protoResType = protoRoot.lookupType(protoMethod.responseType);
      console.assert(protoReqType && protoResType);

      // Create the method info if needed.
      if (!methodInfo) {
        methodInfo = {
          callables: [],
          protoMethod,
          protoReqType,
          protoResType,
        };
        this.vTable.set(fullMethodName, methodInfo);
      }

      // Add it to the front of the handler array.
      methodInfo.callables.unshift(boundCallable);

      // Finally update the un-register lambda (recursive tail-call).
      unregister = () => {
        methodInfo!.callables.splice(
          methodInfo!.callables.indexOf(boundCallable),
          1
        );
        unregister();
      };
    }

    let unregistered = false;
    return () => {
      // Only allow unregister-ing once, as it's unchecked.
      if (unregistered) {
        return;
      }

      unregistered = true;
      unregister();
    };
  }
}
