/**
 * This file provides the non-conditional API surface area that generated code
 * uses. It must not contain circular references.
 */
import { ServiceHandlerDispatch } from './rpc/service_handler_dispatch';

// This type is used to version check the proto generated code. It is only
// upreved on breaking changes.
export type ProtoGenAPIVersion = 1;
export const GeneratedAPIVersion = 1;

export interface ServiceScope {
  serviceHandlerDispatch: ServiceHandlerDispatch;
}

export type { ChannelReceiver } from './channels/channel_interfaces';
export type { Node } from './node';
export type { CallContext } from './rpc/service_handler_dispatch';
export { addMetaDefinitionBase64 } from './rpc/proto_registry';

// Values are injected in `index.ts` and the values originate from
// `proto_gen_api_injected.ts`.
// This sucks, but unfortunately we cannot import anything that would cause a
// circular reference like ezpb, Node or even the client synth code.
export const injected: {
  registerHandler: (
    type: string,
    scope: ServiceScope,
    handler: any
  ) => () => void;
  createClient: (type: string, Node: any) => any;
  verify: (type: string, obj: any) => string | null;
  encode: (type: string, obj: any, delimitated: boolean) => Uint8Array;
  decode: (type: string, data: Uint8Array, delimitated: boolean) => any;
} = {} as any;
