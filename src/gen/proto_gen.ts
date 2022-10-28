/**
 * This file is generated by the ezpb CLI. Do not manually edit.
 * @internal
 */
/* eslint-disable */

import * as __ProtoGenAPI from '../proto_gen_api';

// Type error here? It means you need to re-generate this file with the same
// version of the ezpb client you're using.
const ApiVersionAssertion: __ProtoGenAPI.ProtoGenAPIVersion = 1;

export namespace wlabs {
  export namespace ezpb {
    export namespace meta {
      export interface Enum<TNum = number | Long> {
        name?: wlabs.ezpb.meta.Name<TNum>;
        fields?: wlabs.ezpb.meta.Enum.Field<TNum>[];
      }

      export interface Enum_WithDefaultValues {
        name?: wlabs.ezpb.meta.Name_WithDefaultValues;
        fields: wlabs.ezpb.meta.Enum.Field_WithDefaultValues[];
      }

      export namespace Enum {
        export const fullName = 'wlabs.ezpb.meta.Enum';

        export function verify(obj: Enum): string | null {
          return __ProtoGenAPI.injected.verify(fullName, obj);
        }

        export function encode(obj: Enum, delimitated = false): Uint8Array {
          return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
        }

        export function decode(
          data: Uint8Array,
          delimitated = false,
        ): Enum_WithDefaultValues {
          return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
        }
      }

      export interface Meta<TNum = number | Long> {
        services?: wlabs.ezpb.meta.Service<TNum>[];
        types?: wlabs.ezpb.meta.Type<TNum>[];
        enums?: wlabs.ezpb.meta.Enum<TNum>[];
      }

      export interface Meta_WithDefaultValues {
        services: wlabs.ezpb.meta.Service_WithDefaultValues[];
        types: wlabs.ezpb.meta.Type_WithDefaultValues[];
        enums: wlabs.ezpb.meta.Enum_WithDefaultValues[];
      }

      export namespace Meta {
        export const fullName = 'wlabs.ezpb.meta.Meta';

        export function verify(obj: Meta): string | null {
          return __ProtoGenAPI.injected.verify(fullName, obj);
        }

        export function encode(obj: Meta, delimitated = false): Uint8Array {
          return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
        }

        export function decode(
          data: Uint8Array,
          delimitated = false,
        ): Meta_WithDefaultValues {
          return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
        }
      }

      export interface Name<TNum = number | Long> {
        namespace?: string;
        name?: string;
      }

      export interface Name_WithDefaultValues {
        namespace: string;
        name: string;
      }

      export namespace Name {
        export const fullName = 'wlabs.ezpb.meta.Name';

        export function verify(obj: Name): string | null {
          return __ProtoGenAPI.injected.verify(fullName, obj);
        }

        export function encode(obj: Name, delimitated = false): Uint8Array {
          return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
        }

        export function decode(
          data: Uint8Array,
          delimitated = false,
        ): Name_WithDefaultValues {
          return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
        }
      }

      export interface Service<TNum = number | Long> {
        name?: wlabs.ezpb.meta.Name<TNum>;
        methods?: wlabs.ezpb.meta.Service.Method<TNum>[];
      }

      export interface Service_WithDefaultValues {
        name?: wlabs.ezpb.meta.Name_WithDefaultValues;
        methods: wlabs.ezpb.meta.Service.Method_WithDefaultValues[];
      }

      export namespace Service {
        export const fullName = 'wlabs.ezpb.meta.Service';

        export function verify(obj: Service): string | null {
          return __ProtoGenAPI.injected.verify(fullName, obj);
        }

        export function encode(obj: Service, delimitated = false): Uint8Array {
          return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
        }

        export function decode(
          data: Uint8Array,
          delimitated = false,
        ): Service_WithDefaultValues {
          return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
        }
      }

      export interface Type<TNum = number | Long> {
        name?: wlabs.ezpb.meta.Name<TNum>;
        fields?: wlabs.ezpb.meta.Type.Field<TNum>[];
      }

      export interface Type_WithDefaultValues {
        name?: wlabs.ezpb.meta.Name_WithDefaultValues;
        fields: wlabs.ezpb.meta.Type.Field_WithDefaultValues[];
      }

      export namespace Type {
        export const fullName = 'wlabs.ezpb.meta.Type';

        export function verify(obj: Type): string | null {
          return __ProtoGenAPI.injected.verify(fullName, obj);
        }

        export function encode(obj: Type, delimitated = false): Uint8Array {
          return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
        }

        export function decode(
          data: Uint8Array,
          delimitated = false,
        ): Type_WithDefaultValues {
          return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
        }
      }

      export namespace Enum {
        export interface Field<TNum = number | Long> {
          name?: string;
          value?: number;
        }

        export interface Field_WithDefaultValues {
          name: string;
          value: number;
        }

        export namespace Field {
          export const fullName = 'wlabs.ezpb.meta.Enum.Field';

          export function verify(obj: Field): string | null {
            return __ProtoGenAPI.injected.verify(fullName, obj);
          }

          export function encode(obj: Field, delimitated = false): Uint8Array {
            return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
          }

          export function decode(
            data: Uint8Array,
            delimitated = false,
          ): Field_WithDefaultValues {
            return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
          }
        }
      }

      export namespace Service {
        export interface Method<TNum = number | Long> {
          name?: string;
          reqFullTypeName?: string;
          resFullTypeName?: string;
          isReqStreamed?: boolean;
          isResStreamed?: boolean;
        }

        export interface Method_WithDefaultValues {
          name: string;
          reqFullTypeName: string;
          resFullTypeName: string;
          isReqStreamed: boolean;
          isResStreamed: boolean;
        }

        export namespace Method {
          export const fullName = 'wlabs.ezpb.meta.Service.Method';

          export function verify(obj: Method): string | null {
            return __ProtoGenAPI.injected.verify(fullName, obj);
          }

          export function encode(obj: Method, delimitated = false): Uint8Array {
            return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
          }

          export function decode(
            data: Uint8Array,
            delimitated = false,
          ): Method_WithDefaultValues {
            return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
          }
        }
      }

      export namespace Type {
        export interface Field<TNum = number | Long> {
          name?: string;
          id?: number;
          typeFullName?: string;
          isOptional?: boolean;
          isRepeated?: boolean;
          partOf?: string;
          classification?: wlabs.ezpb.meta.Type.Field.Classification;
        }

        export interface Field_WithDefaultValues {
          name: string;
          id: number;
          typeFullName: string;
          isOptional: boolean;
          isRepeated: boolean;
          partOf: string;
          classification: wlabs.ezpb.meta.Type.Field.Classification;
        }

        export namespace Field {
          export const fullName = 'wlabs.ezpb.meta.Type.Field';

          export function verify(obj: Field): string | null {
            return __ProtoGenAPI.injected.verify(fullName, obj);
          }

          export function encode(obj: Field, delimitated = false): Uint8Array {
            return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
          }

          export function decode(
            data: Uint8Array,
            delimitated = false,
          ): Field_WithDefaultValues {
            return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
          }
        }

        export namespace Field {
          export enum Classification {
            Primitive = 1,
            String = 2,
            Bytes = 3,
            Enum = 4,
            EmbeddedMessage = 5,
          }
        }
      }
    }

    export namespace transport {
      export interface MsgHeader<TNum = number | Long> {
        exchangeId?: TNum;
        exchangeContinues?: boolean;
        exchangeType?: string;
        error?: wlabs.ezpb.transport.Status<TNum>;
        noPayload?: boolean;
        auth?: string;
      }

      export interface MsgHeader_WithDefaultValues {
        exchangeId: Long;
        exchangeContinues: boolean;
        exchangeType: string;
        error?: wlabs.ezpb.transport.Status_WithDefaultValues;
        noPayload: boolean;
        auth: string;
      }

      export namespace MsgHeader {
        export const fullName = 'wlabs.ezpb.transport.MsgHeader';

        export function verify(obj: MsgHeader): string | null {
          return __ProtoGenAPI.injected.verify(fullName, obj);
        }

        export function encode(
          obj: MsgHeader,
          delimitated = false,
        ): Uint8Array {
          return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
        }

        export function decode(
          data: Uint8Array,
          delimitated = false,
        ): MsgHeader_WithDefaultValues {
          return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
        }
      }

      export interface Status<TNum = number | Long> {
        code?: number;
        message?: string;
      }

      export interface Status_WithDefaultValues {
        code: number;
        message: string;
      }

      export namespace Status {
        export const fullName = 'wlabs.ezpb.transport.Status';

        export function verify(obj: Status): string | null {
          return __ProtoGenAPI.injected.verify(fullName, obj);
        }

        export function encode(obj: Status, delimitated = false): Uint8Array {
          return __ProtoGenAPI.injected.encode(fullName, obj, delimitated);
        }

        export function decode(
          data: Uint8Array,
          delimitated = false,
        ): Status_WithDefaultValues {
          return __ProtoGenAPI.injected.decode(fullName, data, delimitated);
        }
      }
    }
  }
}

// This registers the reflection object for runtime use. It's a binary
// (base64 encoded) `protobuf wlabs.ezpb.meta.Meta` message.
__ProtoGenAPI.addMetaDefinitionBase64(
  'EuQBCiEKFHdsYWJzLmV6cGIudHJhbnNwb3J0EglNc2dIZWFkZXISGwoKZXhjaGFuZ2VJZBABGgVpbnQ2NCABKAA4ARIhChFleGNoYW5nZUNvbnRpbnVlcxACGgRib29sIAEoADgBEh4KDGV4Y2hhbmdlVHlwZRADGgZzdHJpbmcgASgAOAISLAoFZXJyb3IQBBobd2xhYnMuZXpwYi50cmFuc3BvcnQuU3RhdHVzIAEoADgFEhkKCW5vUGF5bG9hZBAFGgRib29sIAEoADgBEhYKBGF1dGgQBhoGc3RyaW5nIAEoADgCElIKHgoUd2xhYnMuZXpwYi50cmFuc3BvcnQSBlN0YXR1cxIVCgRjb2RlEAEaBWludDMyIAEoADgBEhkKB21lc3NhZ2UQAhoGc3RyaW5nIAEoADgCEpQBChcKD3dsYWJzLmV6cGIubWV0YRIETWV0YRIrCghzZXJ2aWNlcxABGhd3bGFicy5lenBiLm1ldGEuU2VydmljZSABKAE4BRIlCgV0eXBlcxACGhR3bGFicy5lenBiLm1ldGEuVHlwZSABKAE4BRIlCgVlbnVtcxADGhR3bGFicy5lenBiLm1ldGEuRW51bSABKAE4BRJOChcKD3dsYWJzLmV6cGIubWV0YRIETmFtZRIbCgluYW1lc3BhY2UQARoGc3RyaW5nIAEoADgCEhYKBG5hbWUQAhoGc3RyaW5nIAEoADgCEm0KFwoPd2xhYnMuZXpwYi5tZXRhEgRUeXBlEiQKBG5hbWUQARoUd2xhYnMuZXpwYi5tZXRhLk5hbWUgASgAOAUSLAoGZmllbGRzEAIaGndsYWJzLmV6cGIubWV0YS5UeXBlLkZpZWxkIAEoATgFEoQCCh0KFHdsYWJzLmV6cGIubWV0YS5UeXBlEgVGaWVsZBIWCgRuYW1lEAEaBnN0cmluZyABKAA4AhIUCgJpZBACGgZ1aW50MzIgASgAOAESHgoMdHlwZUZ1bGxOYW1lEAMaBnN0cmluZyABKAA4AhIaCgppc09wdGlvbmFsEAQaBGJvb2wgASgAOAESGgoKaXNSZXBlYXRlZBAFGgRib29sIAEoADgBEhgKBnBhcnRPZhAGGgZzdHJpbmcgASgAOAISQwoOY2xhc3NpZmljYXRpb24QBxopd2xhYnMuZXpwYi5tZXRhLlR5cGUuRmllbGQuQ2xhc3NpZmljYXRpb24gASgAOAQSbQoXCg93bGFicy5lenBiLm1ldGESBEVudW0SJAoEbmFtZRABGhR3bGFicy5lenBiLm1ldGEuTmFtZSABKAA4BRIsCgZmaWVsZHMQAhoad2xhYnMuZXpwYi5tZXRhLkVudW0uRmllbGQgASgBOAUSTwodChR3bGFicy5lenBiLm1ldGEuRW51bRIFRmllbGQSFgoEbmFtZRABGgZzdHJpbmcgASgAOAISFgoFdmFsdWUQAhoFaW50MzIgASgAOAESdQoaCg93bGFicy5lenBiLm1ldGESB1NlcnZpY2USJAoEbmFtZRABGhR3bGFicy5lenBiLm1ldGEuTmFtZSABKAA4BRIxCgdtZXRob2RzEAIaHndsYWJzLmV6cGIubWV0YS5TZXJ2aWNlLk1ldGhvZCABKAE4BRK/AQohChd3bGFicy5lenBiLm1ldGEuU2VydmljZRIGTWV0aG9kEhYKBG5hbWUQARoGc3RyaW5nIAEoADgCEiEKD3JlcUZ1bGxUeXBlTmFtZRACGgZzdHJpbmcgASgAOAISIQoPcmVzRnVsbFR5cGVOYW1lEAMaBnN0cmluZyABKAA4AhIdCg1pc1JlcVN0cmVhbWVkEAQaBGJvb2wgASgAOAESHQoNaXNSZXNTdHJlYW1lZBAFGgRib29sIAEoADgBGnMKLAoad2xhYnMuZXpwYi5tZXRhLlR5cGUuRmllbGQSDkNsYXNzaWZpY2F0aW9uEg0KCVByaW1pdGl2ZRABEgoKBlN0cmluZxACEgkKBUJ5dGVzEAMSCAoERW51bRAEEhMKD0VtYmVkZGVkTWVzc2FnZRAF',
);
