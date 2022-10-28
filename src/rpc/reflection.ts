import {
  IDescriptorProto,
  IEnumDescriptorProto,
  IFieldDescriptorProto,
  IFileDescriptorProto,
  IFileDescriptorSet,
  IMethodDescriptorProto,
  IServiceDescriptorProto,
} from 'protobufjs/ext/descriptor';

// For side-effects (monkey-patching Root)
require('protobufjs/ext/descriptor/index.js');

export class ProtoReflection {
  public readonly serviceSpecs = new Map<string, ServiceSpec>();
  public readonly enumSpecs = new Map<string, EnumSpec>();
  public readonly messageSpecs = new Map<string, MessageSpec>();

  constructor(fileSet: IFileDescriptorSet) {
    for (const file of fileSet.file) {
      this.addFile(file);
    }
  }

  public static fromRoot(root: any) {
    const fileSet = root.toDescriptor() as IFileDescriptorSet;
    return new ProtoReflection(fileSet);
  }

  public services(): ServiceSpec[] {
    return Array.from(this.serviceSpecs.values());
  }

  private resolve<T>(
    specs: Map<string, T>,
    namespace: string,
    name: string
  ): T {
    while (namespace) {
      const fullName = `${namespace}.${name}`;
      const spec = specs.get(fullName);
      if (spec) {
        return spec;
      }
      // Strip last dotted component
      namespace = namespace.substr(0, namespace.lastIndexOf('.'));
    }
    const spec = specs.get(name);
    if (spec) {
      return spec;
    }
    // Malformed/incomplete FileSet (definitely not a bug because my code is perfect)
    throw `failed to resolve ${name} in ${namespace}`;
  }

  private addFile(file: IFileDescriptorProto) {
    const packageName = file.package || '';
    this.addMessages(packageName, file.messageType);
    this.addEnums(packageName, file.enumType);
    this.addServices(packageName, file.service);
  }

  private addMessages(namespace: string, messages?: IDescriptorProto[]) {
    for (const message of messages || []) {
      const fullName = `${namespace}.${message.name}`;
      this.messageSpecs.set(
        fullName,
        new MessageSpec(
          namespace,
          message.name!,
          message.field?.map((field) =>
            this.buildFieldSpec(fullName, field, message)
          ) ?? []
        )
      );
      this.addMessages(fullName, message.nestedType);
      this.addEnums(fullName, message.enumType);
    }
  }

  private buildFieldSpec(
    namespace: string,
    field: IFieldDescriptorProto,
    parent: IDescriptorProto
  ): FieldSpec {
    const name = field.name!;
    const type = field.type! as FieldType;
    const repeated = field.label == 3; // LABEL_REPEATED = 3
    // LOL wut
    const oneof = parent.oneofDecl?.[field.oneofIndex ?? -1]?.name;
    switch (type) {
      case FieldType.Enum: {
        const enumSpec = () =>
          this.resolve(this.enumSpecs, namespace, field.typeName!);
        return new EnumFieldSpec(name, enumSpec, repeated, oneof);
      }
      case FieldType.Message: {
        const messageSpec = () =>
          this.resolve(this.messageSpecs, namespace, field.typeName!);
        return new MessageFieldSpec(name, messageSpec, repeated, oneof);
      }
      default:
        return new FieldSpec(name, type, repeated, oneof);
    }
  }

  private addEnums(namespace: string, enumTypes?: IEnumDescriptorProto[]) {
    for (const enumType of enumTypes ?? []) {
      const spec = new EnumSpec(
        namespace,
        enumType.name!,
        new Map(enumType.value?.map((v) => [v.name!, v.number!]))
      );
      this.enumSpecs.set(spec.fullName, spec);
    }
  }

  private addServices(
    packageName: string,
    services?: IServiceDescriptorProto[]
  ) {
    for (const service of services || []) {
      const spec = new ServiceSpec(
        packageName,
        service.name!,
        service.method?.map((m) => this.buildMethodSpec(packageName, m)) ?? []
      );
      this.serviceSpecs.set(spec.fullName, spec);
    }
  }

  private buildMethodSpec(
    namespace: string,
    method: IMethodDescriptorProto
  ): MethodSpec {
    const resolveMessage = (name: string) =>
      this.resolve(this.messageSpecs, namespace, name);
    return {
      name: method.name!,
      get inputMessage() {
        return resolveMessage(method.inputType!);
      },
      get outputMessage() {
        return resolveMessage(method.outputType!);
      },
      inputStreaming: method.clientStreaming ?? false,
      outputStreaming: method.serverStreaming ?? false,
    };
  }
}

class Namespaced {
  constructor(
    public readonly namespace: string,
    public readonly name: string
  ) {}

  get fullName(): string {
    return `${this.namespace}.${this.name}`;
  }
}

export class ServiceSpec extends Namespaced {
  constructor(
    namespace: string,
    name: string,
    public readonly methods: MethodSpec[]
  ) {
    super(namespace, name);
  }
}

export interface MethodSpec {
  readonly name: string;
  readonly inputMessage: MessageSpec;
  readonly outputMessage: MessageSpec;
  readonly inputStreaming: boolean;
  readonly outputStreaming: boolean;
}

export type NamedType = EnumSpec | MessageSpec;

export class EnumSpec extends Namespaced {
  constructor(
    namespace: string,
    name: string,
    public readonly values: ReadonlyMap<string, number>
  ) {
    super(namespace, name);
  }

  public valueName(value: number): string | undefined {
    for (const [key, val] of Array.from(this.values.entries())) {
      if (val === value) {
        return key;
      }
    }
    return undefined;
  }
}

export class MessageSpec extends Namespaced {
  constructor(
    namespace: string,
    name: string,
    public readonly fields: FieldSpec[]
  ) {
    super(namespace, name);
  }
}

export enum FieldType {
  Double = 1,
  Float = 2,
  Int64 = 3,
  UInt64 = 4,
  Int32 = 5,
  Fixed64 = 6,
  Fixed32 = 7,
  Bool = 8,
  String = 9,
  Group = 10,
  Message = 11,
  Bytes = 12,
  UInt32 = 13,
  Enum = 14,
  SFixed32 = 15,
  SFixed64 = 16,
  SInt32 = 17,
  SInt64 = 18,
}

export enum FieldKind {
  Bool,
  Int,
  Float,
  Bytes,
  String,
  Enum,
  Message,
}

function fieldTypeKind(type: FieldType): FieldKind {
  switch (type) {
    case FieldType.Bool:
      return FieldKind.Bool;
    case FieldType.Int64:
    case FieldType.UInt64:
    case FieldType.Int32:
    case FieldType.Fixed64:
    case FieldType.Fixed32:
    case FieldType.SFixed32:
    case FieldType.SFixed64:
    case FieldType.SInt32:
    case FieldType.SInt64:
    case FieldType.UInt32:
      return FieldKind.Int;
    case FieldType.Float:
    case FieldType.Double:
      return FieldKind.Float;
    case FieldType.Bytes:
      return FieldKind.Bytes;
    case FieldType.String:
      return FieldKind.String;
    case FieldType.Enum:
      return FieldKind.Enum;
    case FieldType.Message:
    case FieldType.Group:
      return FieldKind.Message;
  }
}

export class FieldSpec {
  constructor(
    public readonly name: string,
    public readonly type: FieldType,
    public readonly repeated: boolean,
    public readonly oneof?: string
  ) {}
  get kind() {
    return fieldTypeKind(this.type);
  }
}

export class EnumFieldSpec extends FieldSpec {
  constructor(
    name: string,
    public readonly enumSpec: () => EnumSpec,
    repeated: boolean,
    oneof?: string
  ) {
    super(name, FieldType.Enum, repeated, oneof);
  }
}

export class MessageFieldSpec extends FieldSpec {
  constructor(
    name: string,
    public readonly messageSpec: () => MessageSpec,
    repeated: boolean,
    oneof?: string
  ) {
    super(name, FieldType.Message, repeated, oneof);
  }
}
