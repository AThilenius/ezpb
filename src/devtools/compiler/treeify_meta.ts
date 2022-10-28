import { wlabs } from '../../gen/proto_gen_bootstrap';

/**
 * Converts a compiled `Meta` object into a tree structure, organized by
 * namespace. This is useful for code generators that needs to walk the data
 * as a tree instead of flat lists.
 */
export function treeifyMeta(
  meta: wlabs.ezpb.meta.Meta_WithDefaultValues
): Namespace {
  const root: Namespace = {
    meta: {
      services: [],
      types: [],
      enums: [],
    },
    children: [],
  };

  const getNamespace = (path?: string[]) => {
    let namespace = root;
    outer: for (const part of path ?? []) {
      // See if it's an existing child.
      for (const child of namespace.children) {
        if (child.name === part) {
          namespace = child;
          continue outer;
        }
      }

      // Create the child and alphabetize.
      const child = {
        name: part,
        meta: {
          services: [],
          types: [],
          enums: [],
        },
        children: [],
      };
      namespace.children.push(child);
      namespace.children = namespace.children.sort((l, r) =>
        l.name!.localeCompare(r.name!)
      );
      namespace = child;
    }

    return namespace;
  };

  for (const type of meta.types) {
    const namespace = getNamespace(type.name!.namespace?.split('.'));
    namespace.meta.types.push(type);
    namespace.meta.types = namespace.meta.types.sort((l, r) =>
      l.name!.name!.localeCompare(r.name!.name!)
    );
  }

  for (const tEnum of meta.enums) {
    const namespace = getNamespace(tEnum.name!.namespace?.split('.'));
    namespace.meta.enums.push(tEnum);
    namespace.meta.enums = namespace.meta.enums.sort((l, r) =>
      l.name!.name!.localeCompare(r.name!.name!)
    );
  }

  for (const service of meta.services) {
    const namespace = getNamespace(service.name!.namespace?.split('.'));
    namespace.meta.services.push(service);
    namespace.meta.services = namespace.meta.services.sort((l, r) =>
      l.name!.name!.localeCompare(r.name!.name!)
    );
  }

  return root;
}

export interface Namespace {
  name?: string;
  meta: wlabs.ezpb.meta.Meta_WithDefaultValues;
  children: Namespace[];
}
