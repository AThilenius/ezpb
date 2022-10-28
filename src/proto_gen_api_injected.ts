import { Node } from './node';
import { injected, ServiceScope } from './proto_gen_api';
import { protoRoot } from './rpc/proto_registry';
import { synthesizeClient } from './rpc/service_client_synthesis';

function registerHandler(type: string, scope: ServiceScope, handler: any) {
  scope.serviceHandlerDispatch.registerHandler(type, handler);
}

function createClient(type: string, Node: Node) {
  return synthesizeClient(type, Node);
}

function verify(type: string, obj: any) {
  const protoType = protoRoot.lookupTypeOrEnum(type);
  return protoType.verify(obj);
}

function encode(type: string, obj: any, delimitated: boolean) {
  const protoType = protoRoot.lookupTypeOrEnum(type);
  return delimitated
    ? protoType.encodeDelimited(obj).finish()
    : protoType.encode(obj).finish();
}

function decode(type: string, data: Uint8Array, delimitated: boolean) {
  const protoType = protoRoot.lookupTypeOrEnum(type);
  const msg = delimitated
    ? protoType.decodeDelimited(data)
    : protoType.decode(data);
  return protoType.toObject(msg, {
    defaults: true,
  });
}

export function injectProtoGenApi(obj: any) {
  Object.assign(obj, {
    registerHandler,
    createClient,
    verify,
    encode,
    decode,
  } as typeof injected);
}
