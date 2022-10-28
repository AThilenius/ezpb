import protobuf from 'protobufjs';

/**
 * Loads proto file(s) or root into an aggregated structure, without duplicates.
 * The loaded data is still in protobuf.js format however, it has just been
 * de-duplicated by full name.
 */
export class ProtoDefinitions {
  public readonly types: protobuf.Type[] = [];
  public readonly enums: protobuf.Enum[] = [];
  public readonly services: protobuf.Service[] = [];

  private readonly loadedObjects = new Set<string>();

  private constructor() {}

  public static async fromProtoPaths(
    filePaths: string | string[]
  ): Promise<ProtoDefinitions> {
    const filePathsArr =
      typeof filePaths === 'string' ? [filePaths] : filePaths;
    const loadedRoots = await Promise.all(
      filePathsArr.map((path) => protobuf.load(path))
    );
    const def = new ProtoDefinitions();
    for (const root of loadedRoots) {
      def.addRoot(root);
    }

    return def;
  }

  public static fromRoot(root: protobuf.Root): ProtoDefinitions {
    const def = new ProtoDefinitions();
    def.addRoot(root);
    return def;
  }

  public addRoot(root: protobuf.Root) {
    if (!root.nested) {
      return;
    }

    this.types.push(
      ...this.gatherRecursive<protobuf.Type>(
        root.nested,
        (ro) => ro instanceof protobuf.Type,
        't'
      )
    );
    this.enums.push(
      ...this.gatherRecursive<protobuf.Enum>(
        root.nested,
        (ro) => ro instanceof protobuf.Enum,
        'e'
      )
    );
    this.services.push(
      ...this.gatherRecursive<protobuf.Service>(
        root.nested,
        (ro) => ro instanceof protobuf.Service,
        's'
      )
    );
  }

  private gatherRecursive<T>(
    reflectionObject: {
      [k: string]: protobuf.ReflectionObject;
    },
    predicate: (ro: protobuf.ReflectionObject) => boolean,
    key: string
  ): T[] {
    const items: T[] = [];

    for (const name of Object.keys(reflectionObject)) {
      const nestedReflectObj = reflectionObject[name];

      if (
        predicate(nestedReflectObj) &&
        !this.hasObjAlready(`${key}:${nestedReflectObj.fullName}`)
      ) {
        items.push((nestedReflectObj as any) as T);
      }

      // Recurse down if the reflection object has a nested.
      if ((nestedReflectObj as any).nested) {
        items.push(
          ...this.gatherRecursive<T>(
            (nestedReflectObj as any).nested,
            predicate,
            key
          )
        );
      }
    }

    return items;
  }

  private hasObjAlready(fullName: string): boolean {
    if (this.loadedObjects.has(fullName)) {
      return true;
    }
    this.loadedObjects.add(fullName);
    return false;
  }
}
