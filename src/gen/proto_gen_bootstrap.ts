/**
 * This file is generated by the ezpb CLI. Do not manually edit.
 * @internal
 */
/* eslint-disable */

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

      export interface Name<TNum = number | Long> {
        namespace?: string;
        name?: string;
      }

      export interface Name_WithDefaultValues {
        namespace: string;
        name: string;
      }

      export interface Service<TNum = number | Long> {
        name?: wlabs.ezpb.meta.Name<TNum>;
        methods?: wlabs.ezpb.meta.Service.Method<TNum>[];
      }

      export interface Service_WithDefaultValues {
        name?: wlabs.ezpb.meta.Name_WithDefaultValues;
        methods: wlabs.ezpb.meta.Service.Method_WithDefaultValues[];
      }

      export interface Type<TNum = number | Long> {
        name?: wlabs.ezpb.meta.Name<TNum>;
        fields?: wlabs.ezpb.meta.Type.Field<TNum>[];
      }

      export interface Type_WithDefaultValues {
        name?: wlabs.ezpb.meta.Name_WithDefaultValues;
        fields: wlabs.ezpb.meta.Type.Field_WithDefaultValues[];
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
  }
}

// The --bootstrap flag was specified, so we register the reflection
// object as a JSON object instead of the normal proto meta definition.
export const bootstrapJson = {
  nested: {
    '': {
      nested: {
        wlabs: {
          nested: {
            ezpb: {
              nested: {
                meta: {
                  nested: {
                    Meta: {
                      fields: {
                        services: { rule: 'repeated', type: 'Service', id: 1 },
                        types: { rule: 'repeated', type: 'Type', id: 2 },
                        enums: { rule: 'repeated', type: 'Enum', id: 3 },
                      },
                    },
                    Name: {
                      fields: {
                        namespace: { type: 'string', id: 1 },
                        name: { type: 'string', id: 2 },
                      },
                    },
                    Type: {
                      fields: {
                        name: { type: 'Name', id: 1 },
                        fields: { rule: 'repeated', type: 'Field', id: 2 },
                      },
                      nested: {
                        Field: {
                          fields: {
                            name: { type: 'string', id: 1 },
                            id: { type: 'uint32', id: 2 },
                            typeFullName: { type: 'string', id: 3 },
                            isOptional: { type: 'bool', id: 4 },
                            isRepeated: { type: 'bool', id: 5 },
                            partOf: { type: 'string', id: 6 },
                            classification: { type: 'Classification', id: 7 },
                          },
                          nested: {
                            Classification: {
                              values: {
                                Primitive: 1,
                                String: 2,
                                Bytes: 3,
                                Enum: 4,
                                EmbeddedMessage: 5,
                              },
                            },
                          },
                        },
                      },
                    },
                    Enum: {
                      fields: {
                        name: { type: 'Name', id: 1 },
                        fields: { rule: 'repeated', type: 'Field', id: 2 },
                      },
                      nested: {
                        Field: {
                          fields: {
                            name: { type: 'string', id: 1 },
                            value: { type: 'int32', id: 2 },
                          },
                        },
                      },
                    },
                    Service: {
                      fields: {
                        name: { type: 'Name', id: 1 },
                        methods: { rule: 'repeated', type: 'Method', id: 2 },
                      },
                      nested: {
                        Method: {
                          fields: {
                            name: { type: 'string', id: 1 },
                            reqFullTypeName: { type: 'string', id: 2 },
                            resFullTypeName: { type: 'string', id: 3 },
                            isReqStreamed: { type: 'bool', id: 4 },
                            isResStreamed: { type: 'bool', id: 5 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
