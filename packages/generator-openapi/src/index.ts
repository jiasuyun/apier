import * as apier from '@dee-contrib/apier';
import * as openapi from 'openapi3-ts';
import { ApierKind, colonToCurlybrace } from '@dee-contrib/apier-utils';

const OPERATION_KEYS = ['tags', 'description', 'deperacated', 'security', 'servers'];
const PARAMETER_KEYS = ['name', 'in', 'description', 'required', 'deprecated', 'allowEmptyValue'];
const FUN_KEYS = ['optional', 'saveSchema', 'useSchema', 'array'];

export interface GeneratorResult {
  paths: openapi.PathsObject;
  components: openapi.ComponentsObject;
}

export default class Generator {
  public readonly value: GeneratorResult;
  private apier: apier.Apier;
  private operation: openapi.OperationObject;
  constructor(apier: apier.Apier) {
    const schemas: openapi.SchemasObject = {};
    const operation: openapi.OperationObject = { responses: {} };
    const url = colonToCurlybrace(apier.url);
    this.apier = apier;
    this.value = { paths: { [url]: { [apier.method]: operation } }, components: { schemas } };
    this.operation = operation;
    this.generate()
  }

  generate() {
    const { apier } = this;
    const { comment, model: { req } } = apier;
    const commentUtil = comment.retrive();
    const summary = commentUtil.val('summary', apier.name);
    const operation: any = { operationId: apier.name, summary };
    Object.assign(operation, commentUtil.pick(OPERATION_KEYS));
    const parameters = this.dealParameters();
    if (parameters.length > 0) {
      operation.parameters = parameters;
    }
    if (req.model.body) this.dealReqeustBody();
    this.dealResponses();
  }
  dealParameters(): (openapi.ParameterObject | openapi.ReferenceObject)[] {
    const parameters = [];
    ['params', 'query', 'headers'].forEach(key => {
      const apierParameters: apier.ApierObject = this.apier.model.req.model[key];
      if (!apierParameters) return;
      Object.keys(apierParameters.model).forEach(name => {
        const apierParameter: apier.ApierItem = apierParameters.model[name];
        const commentUtil = apierParameter.comment.retrive();
        const useSchema = commentUtil.val('useSchema');
        if (useSchema) return parameters.push(createRef(useSchema))
        const parameter: openapi.ParameterObject = { name, 'in': inOfParameter(key) }
        Object.assign(parameter, commentUtil.pick(PARAMETER_KEYS));
        parameter.schema = this.createSchema(apierParameter);
        [...PARAMETER_KEYS, ...FUN_KEYS, 'description'].forEach(key => delete parameter.schema[key]);
        if (commentUtil.val('optional')) parameter.required = true;
        const saveSchema = commentUtil.val('saveSchema');
        if (saveSchema) parameter.schema = this.saveSchema(saveSchema, parameter.schema);
        parameters.push(parameter);
      });
    });
    return parameters;
  }
  dealReqeustBody() {
    const body: apier.ApierJSONKind = this.apier.model.req.model.body;
    const commentUtil = body.comment.retrive();
    const requestBody: openapi.RequestBodyObject = { content: {} };
    this.operation.requestBody = requestBody;
    const description = commentUtil.val('description');
    if (description) requestBody.description = description;
    if (!commentUtil.val('optional')) requestBody.required = true;
    const useSchema = commentUtil.val('useSchema');
    const contentType = commentUtil.val('contentType', 'application/json');
    if (useSchema) return requestBody.content = { [contentType]: { schema: createRef(useSchema) } }
    const schemaName = commentUtil.val('saveSchema', nameOfReqResSchema(this.apier.name, 'Request'));
    requestBody.content = { [contentType]: { schema: this.saveSchema(schemaName, this.createSchema(body)) } }
  }
  dealResponses() {
    const res: apier.ApierRes = this.apier.model.res;
    const commentUtil = res.comment.retrive();
    const { status, body } = res.model;
    const responses: openapi.ResponsesObject = { [status]: {} };
    this.operation.responses = responses;
    responses[status].description = commentUtil.val('description', 'SUCCESS');
    const contentType = commentUtil.val('contentType', 'application/json');
    const useSchema = commentUtil.val('useSchema');
    if (useSchema) return responses[status].content = { [contentType]: { schema: createRef(useSchema) } };
    const schemaName = commentUtil.val('saveSchema', nameOfReqResSchema(this.apier.name, 'Response'));
    responses[status].content = { [contentType]: { schema: this.saveSchema(schemaName, this.createSchema(body)) } };
  }
  saveSchema(name: string, schema: openapi.SchemaObject): openapi.ReferenceObject {
    this.value.components.schemas[name] = schema;
    return createRef(name);
  }
  createSchema(apierItem: apier.ApierJSONKind): openapi.SchemaObject {
    const schema = {};
    this.schemaUtil(apierItem, schema);
    return schema;
  }
  schemaUtil(apierItem: apier.ApierJSONKind, schema: openapi.SchemaObject): boolean {
    const commentUtil = apierItem.comment.retrive();
    const useSchema = commentUtil.val('useSchema');
    if (useSchema) {
      Object.assign(schema, createRef(useSchema));
      return !commentUtil.val('optional', false);
    };
    if (apierItem instanceof apier.ApierObject) {
      this.schemaObject(apierItem, schema);
    } else if (apierItem instanceof apier.ApierArray) {
      this.schemaArray(apierItem, schema);
    }
    Object.assign(schema, { type: apierItem.kind() }, commentUtil.omit(FUN_KEYS));
    const saveSchema = commentUtil.val('saveSchema');
    if (saveSchema) {
      this.value.components.schemas[saveSchema] = { ...schema };
      Object.keys(schema).forEach(key => delete schema[key]); // clear
      Object.assign(schema, createRef(saveSchema));
    }
    return !commentUtil.val('optional', false);
  }
  schemaArray(apierItem: apier.ApierArray, schema: openapi.SchemaObject) {
    const children = apierItem.model;
    if (children.length === 0) return;
    const commentUtil = apierItem.comment.retrive();
    let strategy = commentUtil.val('array', 'anyOf');
    const items: any = schema.items = {};
    if (children.length === 1) strategy = 'first';
    if (strategy === 'first') {
      this.schemaUtil(children[0], items);
    } else if (strategy = 'anyOf') {
      const anyOf = items.anyOf = [];
      children.forEach((child) => {
        const childSchema = {}
        this.schemaUtil(child, childSchema);
        anyOf.push(childSchema)
      });
    } else {
      this.schemaArrayAll(apierItem, schema);
    }
  }
  schemaArrayAll(apierItem: apier.ApierArray, schema: openapi.SchemaObject) {
    let requiredAll = [];
    let properties = {};
    const children = apierItem.model;
    children.forEach((child) => {
      const childSchema: openapi.SchemaObject = {}
      this.schemaUtil(child, childSchema);
      if (child.kind() === ApierKind.OBJECT) {
        requiredAll = [...requiredAll, ...childSchema.required];
        properties = { ...properties, ...childSchema.properties };
      }
    });
    schema.type = 'object';
    schema.properties = properties;
    const required = filterByCount(requiredAll, children.length);
    if (required.length > 0) schema.required = required;
  }
  schemaObject(apierItem: apier.ApierObject, schema: openapi.SchemaObject) {
    const properties = {};
    const required = [];
    let haveProperties = false;
    for (const key in apierItem.model) {
      haveProperties = true;
      const item = schema.properties[key] = {}
      if (this.schemaUtil(apierItem.model[key], item)) {
        required.push(key);
      }
    }
    if (required.length > 0) schema.required = required;
    if (haveProperties) schema.properties = properties;
  }
}

function createRef(name: string): openapi.ReferenceObject {
  return { ['$ref']: `#/components/schemas/${name}` };
}

function inOfParameter(name: string): openapi.ParameterLocation {
  if (name === 'params') return 'path';
  if (name === 'query') return 'query';
  return 'header';
}

function nameOfReqResSchema(text, tail) {
  return [text[0].toUpperCase(), ...text.slice(1), ...tail].join('')
}

function filterByCount(arr: string[], count: number): string[] {
  const result = [];
  arr.sort().reduce((a, c) => {
    if (c === a.prev) {
      a.count++;
      if (a.count === count) {
        result.push(c);
      }
      return a;
    } else {
      return { prev: c, count: 1 }
    }
  }, { prev: '', count: 0 });
  return result;
}