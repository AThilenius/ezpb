import protobuf from 'protobufjs';
import { ezpb } from '../..';
import { wlabs } from '../../gen/proto_gen_bootstrap';
import {
  addMetaDefinition,
  metaEnums,
  metaServices,
  metaTypes,
  protoRoot,
} from '../../rpc/proto_registry';
import { synthesizeMethod } from '../../rpc/service_client_synthesis';
import { compileFromProtoDefinitions } from '../compiler/proto_ast_compiler';
import { ProtoDefinitions } from '../compiler/proto_loader';
import { Namespace, treeifyMeta } from '../compiler/treeify_meta';
import { globPaths } from './glob';

type Meta = wlabs.ezpb.meta.Meta_WithDefaultValues;

export class RpcUtils {
  private lastDumpTypeIds: any = [];

  constructor(private ezpb: ezpb) {}

  /**
   * Compiles and loads the given proto file path (specified as one or more
   * globs) into the core proto registry. This is the same thing as compiling
   * the files to a .ts file and including that.
   */
  public async addProtoFiles(paths: string | string[], recursive = true) {
    const files = globPaths(paths);
    const protoDefinitions = await ProtoDefinitions.fromProtoPaths(files);
    const meta = compileFromProtoDefinitions(protoDefinitions);
    addMetaDefinition(meta);
  }

  /**
   * Execute an RPC on the given node id, with the given arg. This supports both
   * unary and streamed RPCs (the implementation simply uses the same client
   * synthesis that generated code does).
   * @param nodeId The node ID to execute the RPC on.
   * @param rpcFullName The fully qualified name of the RPC method.
   * @param arg The argument object. This is either the request object itself
   *            for unary RPCs, or an ChannelReceiver for streamed requests.
   * @returns Either a Promise for unary RPCs, or an ChannelReceiver for
   *          streamed responses.
   * @throws If the method is not known at the time of calling.
   */
  public async execRpc<T>(
    nodeId: string,
    rpcFullName: string,
    arg: any,
    options?: RpcExecOptions
  ): Promise<T> {
    // Get the node ref
    const Node = this.ezpb.nodes.get(nodeId);

    if (options?.awaitConnect) {
      await Node.connect();
    }

    // Lookup the method
    const method = protoRoot.lookup(rpcFullName);
    if (!method || !(method instanceof protobuf.Method)) {
      throw new Error(`Method [${method}] is now a known RPC`);
    }

    // Synthesize an executor for the method.
    const executor = synthesizeMethod(method, rpcFullName, Node);

    // Invoke it and return the results. The results are either a Promise or
    // a channel receiver.
    return executor(arg);
  }

  public dumpMeta() {
    this.lastDumpTypeIds = [];
    const t = '\t';

    const tree = treeifyMeta({
      services: metaServices,
      types: metaTypes,
      enums: metaEnums,
    });

    const record = (obj: any) => {
      this.lastDumpTypeIds.push(obj);
      return this.lastDumpTypeIds.length - 1;
    };

    const printMeta = (meta: Meta, indent: string) => {
      for (const type of meta.types) {
        console.log(`(${record(type)})${indent}type ${type.name!.name}`);
      }

      for (const enumT of meta.enums) {
        console.log(`(${record(enumT)})${indent}enum ${enumT.name!.name}`);
      }

      for (const service of meta.services) {
        console.log(
          `(${record(service)})${indent}service ${service.name!.name}`
        );
        for (const method of service.methods) {
          console.log(`(${record(method)})${indent}  rpc ${method.name}`);
        }
      }
    };

    const printNs = (ns: Namespace, indent: string) => {
      let nextIndent = indent;
      if (ns.name) {
        console.log(`(${record(ns)})${indent}namespace ${ns.name}`);
        nextIndent = indent + t;
      }
      printMeta(ns.meta, nextIndent);
      for (const child of ns.children) {
        printNs(child, nextIndent);
      }
    };

    printNs(tree, t);
  }

  public inspect(id: number) {
    if (this.lastDumpTypeIds.length === 0) {
      console.warn('You can only call `inspect` after `dumpMeta`');
      return;
    }

    if (id < 0 || id >= this.lastDumpTypeIds.length) {
      console.warn('Invalid inspect id ', id);
      return;
    }

    console.log(this.lastDumpTypeIds[id]);
  }

  public encode(idOrName: number | string, data: any): any {
    return this.getType(idOrName).encode(data).finish();
  }

  public decode(idOrName: number | string, bytes: Uint8Array): any {
    const type = this.getType(idOrName);
    return type.toObject(type.decode(bytes), { defaults: true });
  }

  private getType(idOrName: number | string): protobuf.Type {
    let fullName = 'UNKNOWN';
    if (typeof idOrName === 'number') {
      if (this.lastDumpTypeIds.length === 0) {
        throw new Error('You can address types by ID before calling dumpMeta');
      }

      const name = this.lastDumpTypeIds[idOrName].name;
      fullName = name.namespace ? name.namespace + name.name : name.name;
    } else if (typeof idOrName === 'string') {
      fullName = idOrName;
    } else {
      throw new Error('Unsupported lookup type ' + typeof idOrName);
    }

    const type = protoRoot.lookupTypeOrEnum(fullName);
    if (!type) {
      throw new Error('Failed to find protobuf type ' + fullName);
    }

    return type;
  }
}

export interface RpcExecOptions {
  awaitConnect?: boolean;
}
