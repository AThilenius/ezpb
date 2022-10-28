import { wlabs } from '../../gen/proto_gen_bootstrap';
import { ProtoDefinitions } from '../compiler/proto_loader';

type EnumField = wlabs.ezpb.meta.Enum.Field_WithDefaultValues;
type Meta = wlabs.ezpb.meta.Meta_WithDefaultValues;
type Method = wlabs.ezpb.meta.Service.Method_WithDefaultValues;
type Name = wlabs.ezpb.meta.Name_WithDefaultValues;
type TypeField = wlabs.ezpb.meta.Type.Field_WithDefaultValues;

/**
 * Compiles a `ProtoDefinition` into a `Meta` object, ready for serialization
 * or loading into the ezpb core.
 */
export function compileFromProtoDefinitions(def: ProtoDefinitions): Meta {
  const meta: Meta = {
    services: [],
    types: [],
    enums: [],
  };

  // Collect services.
  for (const protoService of def.services) {
    const name = getName(protoService);

    // Convert methods
    const methods: Method[] = protoService.methodsArray.map((protoMethod) => {
      const protoReqType = protoService.lookupType(protoMethod.requestType);
      const protoResType = protoService.lookupType(protoMethod.responseType);

      return {
        name: getName(protoMethod).name,
        reqFullTypeName: getFullName(protoReqType),
        resFullTypeName: getFullName(protoResType),
        isReqStreamed: protoMethod.requestStream || false,
        isResStreamed: protoMethod.responseStream || false,
      };
    });

    meta.services!.push({ name, methods });
  }

  // Collect types (excluding enums).
  for (const protobufType of def.types) {
    const name = getName(protobufType);

    // Convert fields.
    const fields: TypeField[] = protobufType.fieldsArray.map((protobufField) =>
      getFieldInfo(protobufField, protobufType)
    );

    meta.types!.push({ name, fields });
  }

  // Collect enums (excluding other types above)
  for (const protoEnum of def.enums) {
    const name = getName(protoEnum);

    // Convert enum fields.
    const fields: EnumField[] = Object.keys(protoEnum.values).map((name) => ({
      name,
      value: protoEnum.values[name],
    }));

    meta.enums!.push({ name, fields });
  }

  return meta;
}

function getName(obj: { name: string; fullName: string }): Name {
  return {
    name: obj.name,
    namespace: obj.fullName
      .split('.')
      .filter((s) => s)
      .slice(0, -1)
      .join('.'),
  };
}

function getFullName(obj: { name: string; fullName: string }) {
  return obj.fullName
    .split('.')
    .filter((s) => s)
    .join('.');
}

function getFieldInfo(
  protoField: protobuf.Field,
  protobufType: protobuf.Type
): TypeField {
  const TClassification = wlabs.ezpb.meta.Type.Field.Classification;
  let typeFullName: string;
  let classification = TClassification.EmbeddedMessage;
  const isPrimitiveType = protoPrimitives.indexOf(protoField.type) >= 0;
  if (isPrimitiveType) {
    typeFullName = protoField.type;
    classification = TClassification.Primitive;
  } else if (protoField.type === 'string') {
    typeFullName = protoField.type;
    classification = TClassification.String;
  } else if (protoField.type === 'bytes') {
    typeFullName = protoField.type;
    classification = TClassification.Bytes;
  } else {
    try {
      // See if it's an enum. This throws if it isn't an enum.
      const enumType = protobufType.lookupEnum(protoField.type);
      typeFullName = getFullName(enumType);
      classification = TClassification.Enum;
    } catch (_) {
      // Only possible thing it could be at this point is an embedded message.
      const embeddedMessageType = protobufType.lookupType(protoField.type);
      typeFullName = getFullName(embeddedMessageType);
      classification = TClassification.EmbeddedMessage;
    }
  }

  return {
    name: getName(protoField).name,
    id: protoField.id,
    typeFullName,
    isOptional: protoField.optional,
    isRepeated: protoField.repeated,
    partOf: protoField.partOf?.fullName,
    classification,
  } as TypeField;
}

const protoPrimitives = [
  'double',
  'float',
  'int32',
  'int64',
  'uint32',
  'uint64',
  'sint32',
  'sint64',
  'fixed32',
  'fixed64',
  'sfixed32',
  'sfixed64',
  'bool',
];
