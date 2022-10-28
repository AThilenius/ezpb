import Long from 'long';
import protobuf from 'protobufjs';
import { bootstrapJson, wlabs } from '../gen/proto_gen_bootstrap';
import { base64ToBytes } from '../utils/base64';
import { sanitizeProtoFullName } from '../utils/string';

type Meta = wlabs.ezpb.meta.Meta_WithDefaultValues;
type Type = wlabs.ezpb.meta.Type_WithDefaultValues;
type Enum = wlabs.ezpb.meta.Enum_WithDefaultValues;
type Service = wlabs.ezpb.meta.Service_WithDefaultValues;
type Name = wlabs.ezpb.meta.Name_WithDefaultValues;

export interface ProtoMethodInfo {
  service: protobuf.Service;
  method: protobuf.Method;
  reqType: protobuf.Type;
  resType: protobuf.Type;
}

// Configure protobuf.js to use Longs before we do anything else.
protobuf.util.Long = Long;
protobuf.configure();

/**
 * The root Protobuf.js object that contains all known proto definitions.
 */
export const protoRoot = protobuf.Root.fromJSON(bootstrapJson);

/**
 * An array of all known meta types.
 */
export const metaTypes: Type[] = [];

/**
 * An array of all known meta enums.
 */
export const metaEnums: Enum[] = [];

/**
 * An array of all known meta services.
 */
export const metaServices: Service[] = [];

/**
 * A Map of method full names to their associated MethodInfo, for fast access.
 */
export const metaMethods = new Map<string, ProtoMethodInfo>();

const metaType = protoRoot.lookupType('wlabs.ezpb.meta.Meta');
const loadedObjects = new Set<string>();

/**
 * Adds a proto definition that has been pre-compiled with the `ezpb` CLI.
 * This is typically found at the bottom of generated code, in the form of
 * binary protobuf data encoded as a base-64 string directly in the source.
 */
export function addMetaDefinitionBase64(base64Meta: string) {
  const binary = base64ToBytes(base64Meta);
  const meta = metaType.toObject(metaType.decode(binary), {
    defaults: true,
  }) as Meta;
  addMetaDefinition(meta);
}

/**
 * Adds a proto definition that has been pre-compiled with the `ezpb` CLI.
 */
export function addMetaDefinition(meta: Meta) {
  const objKnown = (fullName: string) => {
    if (loadedObjects.has(fullName)) {
      return true;
    }
    loadedObjects.add(fullName);
    return false;
  };

  const add = (name: Name, object: protobuf.ReflectionObject) => {
    const namespace = name.namespace
      ? protoRoot.define(name.namespace.split('.'))
      : protoRoot.root;
    namespace.add(object);
  };

  // Load into protobuf.js using the reflection API.
  // TODO: Support proto 'rule', 'extends' and 'options'
  for (const type of meta.types) {
    if (objKnown(`t:${type.name!.namespace}.${type.name!.name}`)) {
      continue;
    }

    // Collect fields that belong to one-of while enumerating fields.
    const oneOfGroups = new Map<string, string[]>();

    const protoType = new protobuf.Type(type.name!.name!);
    for (const field of type.fields) {
      protoType.add(
        new protobuf.Field(
          field.name!,
          field.id!,
          field.typeFullName!,
          field.isRepeated ? 'repeated' : undefined
        )
      );

      // TODO: Protobuf doesn't seem to respect one-of if you set more than one
      // of the values.
      if (field.partOf) {
        if (oneOfGroups.has(field.partOf)) {
          oneOfGroups.get(field.partOf)!.push(field.name);
        } else {
          oneOfGroups.set(field.partOf, [field.name]);
        }
      }
    }

    // Add one-of if any.
    for (const [oneOf, fields] of oneOfGroups.entries()) {
      protoType.add(new protobuf.OneOf(oneOf, fields));
    }

    metaTypes.push(type);
    add(type.name!, protoType);
  }

  for (const tEnum of meta.enums) {
    if (objKnown(`e:${tEnum.name!.namespace}.${tEnum.name!.name}`)) {
      continue;
    }

    const protoEnum = new protobuf.Enum(tEnum.name!.name!);
    for (const field of tEnum.fields) {
      protoEnum.add(field.name!, field.value!);
    }

    metaEnums.push(tEnum);
    add(tEnum.name!, protoEnum);
  }

  for (const service of meta.services) {
    if (objKnown(`s:${service.name!.namespace}.${service.name!.name}`)) {
      continue;
    }

    const protoService = new protobuf.Service(service.name!.name!);
    for (const method of service.methods) {
      protoService.add(
        new protobuf.Method(
          method.name!,
          'rpc',
          method.reqFullTypeName!,
          method.resFullTypeName!,
          method.isReqStreamed!,
          method.isResStreamed!
        )
      );
    }

    metaServices.push(service);
    add(service.name!, protoService);

    // Also index the methods by full name for fast-access.
    for (const method of protoService.methodsArray) {
      const fullName = sanitizeProtoFullName(method.fullName);
      metaMethods.set(fullName, {
        service: protoService,
        method,
        reqType: protoRoot.lookupType(method.requestType),
        resType: protoRoot.lookupType(method.responseType),
      });
    }
  }
}
