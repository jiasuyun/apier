import * as apier from '@dee-contrib/apier';
import * as openapi from 'openapi3-ts';
export interface GeneratorResult {
    paths: openapi.PathsObject;
    components: openapi.ComponentsObject;
}
export default class Generator {
    readonly value: GeneratorResult;
    private apier;
    private operation;
    constructor(apier: apier.Apier);
    generate(): void;
    dealParameters(): (openapi.ParameterObject | openapi.ReferenceObject)[];
    dealReqeustBody(): {
        [x: number]: {
            schema: openapi.ReferenceObject;
        };
    };
    dealResponses(): {
        [x: number]: {
            schema: openapi.ReferenceObject;
        };
    };
    saveSchema(name: string, schema: openapi.SchemaObject): openapi.ReferenceObject;
    createSchema(apierItem: apier.ApierJSONKind): openapi.SchemaObject;
    schemaUtil(apierItem: apier.ApierItem, schema: openapi.SchemaObject): boolean;
    schemaArray(apierItem: apier.ApierArray, schema: openapi.SchemaObject): void;
    schemaArrayAll(apierItem: apier.ApierArray, schema: openapi.SchemaObject): void;
    schemaObject(apierItem: apier.ApierObject, schema: openapi.SchemaObject): void;
}
