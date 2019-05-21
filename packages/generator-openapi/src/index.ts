import * as apier from "@jiasuyun/apier";
import * as openapi from "openapi3-ts";
import { ApierKind, colonToCurlybrace, omitEmptyObject, reorder } from "@jiasuyun/apier-utils";
import { OPERATION_KEYS, PARAMETER_KEYS, SCHEMA_KEYS } from "./constants";
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
    const operation = {};
    const url = colonToCurlybrace(apier.url);
    this.apier = apier;
    this.value = {
      paths: { [url]: { [apier.method]: operation } },
      components: { parameters: {}, responses: {}, schemas }
    };
    this.operation = operation as openapi.OperationObject;
    this.generate();
    omitEmptyObject(this.value);
    reorder(this.value.components, ["parameters", "responses", "schemas"]);
  }

  generate() {
    const { apier } = this;
    const {
      comment,
      model: { req }
    } = apier;
    const commentUtil = comment.retrive();
    const operation = this.operation;
    operation.operationId = apier.name;
    const summary = commentUtil.val("summary", apier.name);
    operation.summary = summary;
    const parameters = this.dealParameters();
    if (parameters.length > 0) {
      operation.parameters = parameters;
    }
    if (req.model.body) this.dealReqeustBody();
    this.dealResponses();
    Object.assign(operation, commentUtil.pick(OPERATION_KEYS));
  }
  dealParameters(): (openapi.ParameterObject | openapi.ReferenceObject)[] {
    const parameters = [];
    ["params", "query", "headers"].forEach(key => {
      const apierParameters: apier.ApierObject = this.apier.model.req.model[key];
      if (!apierParameters) return;
      Object.keys(apierParameters.model).forEach(name => {
        const apierParameter: apier.ApierItem = apierParameters.model[name];
        const commentUtil = apierParameter.comment.retrive();
        const useSchema = commentUtil.val("useSchema");
        if (useSchema) return parameters.push(createRef(useSchema, "parameters"));
        const parameter: openapi.ParameterObject = {
          name,
          in: inOfParameter(key)
        };
        Object.assign(parameter, commentUtil.pick(PARAMETER_KEYS));
        parameter.schema = this.createSchema(apierParameter, { isParameter: true });
        PARAMETER_KEYS.forEach(key => delete parameter.schema[key]);
        if (!commentUtil.val("optional")) parameter.required = true;
        const saveSchema = commentUtil.val("saveSchema");
        if (saveSchema) {
          parameters.push(this.saveParamters(saveSchema, parameter));
        } else {
          parameters.push(parameter);
        }
      });
    });
    return parameters;
  }
  dealBody(body: apier.ApierJSONKind, bodySchema: BodySchemaObject, schemaSuffix: string) {
    const commentUtil = body.comment.retrive();
    const description = commentUtil.val("description");
    if (description) bodySchema.description = description;
    const useSchema = commentUtil.val("useSchema");
    const contentType = commentUtil.val("contentType", "application/json");
    if (useSchema)
      return (bodySchema.content = {
        [contentType]: { schema: createRef(useSchema) }
      });
    const bodySchemaName = commentUtil.val("saveSchema", nameOfReqResSchema(this.apier.name, schemaSuffix));
    bodySchema.content = {
      [contentType]: {
        schema: this.createSchema(body, { bodySchemaName })
      }
    };
  }
  dealReqeustBody() {
    const body: apier.ApierJSONKind = this.apier.model.req.model.body;
    const bodySchema: any = {};
    const commentUtil = body.comment.retrive();
    if (!commentUtil.val("optional")) bodySchema.required = true;
    this.dealBody(body, bodySchema, "Request");
    reorder(bodySchema, ["description", "content", "required"]);
    this.operation.requestBody = bodySchema;
  }
  dealResponses() {
    const resps = this.apier.model.res.map(res => this.dealEachResponse(res));
    const responses: any = this.operation.responses = {};
    for (const { status, resp } of resps) {
      const response = responses[status];
      if (!response) {
        responses[status] = resp;
        continue;
      }
      if (response['$ref']) {
        responses[status] = resp;
        continue;
      }
      if (resp['$ref']) { // SchemaObject is more important than RefObject
        continue;
      }
      const contentType = Object.keys(resp.content)[0];
      const contentTypes = Object.keys(response.content);
      if (contentTypes.indexOf(contentType) === -1) {
        Object.assign(response.content, resp.content);
        continue;
      }
      let currentSchema = response.content[contentType];
      if (currentSchema.schema['$ref']) {
        currentSchema.schema = {
          oneOf: [currentSchema.schema, resp.content[contentType].schema]
        }
      } else {
        currentSchema.schema['oneOf'].push(resp.content[contentType].schema);
      }
    }
  }
  dealEachResponse(res: apier.ApierRes) {
    const commentUtil = res.comment.retrive();
    const { status, body } = res.model;
    const description = commentUtil.val("description", "SUCCESS");
    const contentType = commentUtil.val("contentType", "application/json");
    const useSchema = commentUtil.val("useSchema");
    if (useSchema) {
      return { status, resp: createRef(useSchema, "responses") };
    }
    if (!body) {
      const content = {
        [contentType]: { schema: { type: "object" } }
      };
      return { status, resp: { content } };
    }
    const bodySchema: any = {};
    this.dealBody(body, bodySchema, "Response");
    if (!bodySchema.description) bodySchema.description = description;
    const saveSchema = commentUtil.val("saveSchema");
    let resp: any;
    if (saveSchema) {
      resp = this.saveResponses(saveSchema, bodySchema);
    } else {
      resp = bodySchema;
    }
    reorder(bodySchema, ["description", "content", "required"]);
    return { status, resp };
  }
  saveSchema(name: string, schema: openapi.SchemaObject): openapi.ReferenceObject {
    this.value.components.schemas[name] = schema;
    return createRef(name);
  }
  saveParamters(name: string, schema: openapi.ParameterObject): openapi.ReferenceObject {
    let parameters = this.value.components.parameters;
    if (!parameters) parameters = this.value.components.parameters = {};
    parameters[name] = schema;
    return createRef(name, "parameters");
  }
  saveResponses(name: string, schema: openapi.ResponseObject): openapi.ReferenceObject {
    let responses = this.value.components.responses;
    if (!responses) responses = this.value.components.responses = {};
    responses[name] = schema;
    return createRef(name, "responses");
  }
  createSchema(
    apierItem: apier.ApierJSONKind,
    options: CreateSchemaOptions = { isParameter: false }
  ): openapi.SchemaObject {
    const schema: openapi.SchemaObject = {};
    this.schemaUtil(apierItem, { schema, ...options });
    return schema;
  }
  schemaUtil(apierItem: apier.ApierItem, context: SchemaUtilContext): boolean {
    const { schema, isParameter, bodySchemaName } = context;
    const commentUtil = apierItem.comment.retrive();
    let saveSchema = commentUtil.val("saveSchema");
    if (isParameter) {
      saveSchema = null;
    }
    if (bodySchemaName) {
      saveSchema = bodySchemaName;
      context.bodySchemaName = null;
    }
    const useSchema = commentUtil.val("useSchema");
    if (!isParameter && useSchema) {
      Object.assign(schema, createRef(useSchema));
      return !commentUtil.val("optional", false);
    }
    Object.assign(schema, { type: apierItem.kind() });
    // trick: promote description props
    const description = commentUtil.val("description");
    if (description) schema.description = description;
    if (apierItem.kind() === ApierKind.OBJECT) {
      this.schemaUtilObject(apierItem, context);
    } else if (apierItem.kind() === ApierKind.ARRAY) {
      this.schemaUtilArray(apierItem, context);
    }
    Object.assign(schema, commentUtil.pick(SCHEMA_KEYS));
    if (saveSchema) {
      this.value.components.schemas[saveSchema] = { ...schema };
      Object.keys(schema).forEach(key => delete schema[key]); // clear
      Object.assign(schema, createRef(saveSchema));
    }
    return !commentUtil.val("optional", false);
  }
  schemaUtilArray(apierItem: apier.ApierArray, context: SchemaUtilContext) {
    const { schema } = context;
    const children = apierItem.model;
    if (children.length === 0) return;
    const commentUtil = apierItem.comment.retrive();
    let strategy = commentUtil.val("array", "anyOf");
    const items: any = (schema.items = {});
    if (children.length === 1) strategy = "first";
    if (strategy === "first") {
      this.schemaUtil(children[0], { ...context, schema: items });
    } else if (strategy === "anyOf") {
      const anyOf = (items.anyOf = []);
      children.forEach(child => {
        const childSchema = {};
        this.schemaUtil(child, { ...context, schema: childSchema });
        anyOf.push(childSchema);
      });
    } else {
      this.schemaUtilArrayAll(apierItem, context);
    }
  }
  schemaUtilArrayAll(apierItem: apier.ApierArray, context: SchemaUtilContext) {
    const { schema } = context;
    let requiredAll = [];
    let properties = {};
    let count = 0;
    const children = apierItem.model;
    children.forEach(child => {
      const childSchema: openapi.SchemaObject | openapi.ReferenceObject = {};
      this.schemaUtil(child, { ...context, schema: childSchema });
      if (child.kind() === ApierKind.OBJECT) {
        if (childSchema.type) {
          count++;
          requiredAll = [...requiredAll, ...childSchema.required];
          properties = { ...properties, ...childSchema.properties };
        }
      }
    });
    schema.type = "object";
    schema.properties = properties;
    const required = filterByCount(requiredAll, count);
    if (required.length > 0) schema.required = required;
  }
  schemaUtilObject(apierItem: apier.ApierObject, context: SchemaUtilContext) {
    const { schema } = context;
    const properties = {};
    const required = [];
    let haveProperties = false;
    for (const key in apierItem.model) {
      haveProperties = true;
      const item = (properties[key] = {});
      if (this.schemaUtil(apierItem.model[key], { ...context, schema: item })) {
        required.push(key);
      }
    }
    if (haveProperties) schema.properties = properties;
    if (required.length > 0) schema.required = required;
  }
}

function createRef(name: string, kind: string = "schemas"): openapi.ReferenceObject {
  return { ["$ref"]: `#/components/${kind}/${name}` };
}

function inOfParameter(name: string): openapi.ParameterLocation {
  if (name === "params") return "path";
  if (name === "query") return "query";
  return "header";
}

function nameOfReqResSchema(text, tail) {
  return [text[0].toUpperCase(), ...text.slice(1), ...tail].join("");
}

function filterByCount(arr: string[], count: number): string[] {
  const result = [];
  arr.sort().reduce(
    (a, c) => {
      if (c === a.prev) {
        a.count++;
        if (a.count === count) {
          result.push(c);
        }
        return a;
      } else {
        return { prev: c, count: 1 };
      }
    },
    { prev: "", count: 0 }
  );
  return result;
}

export interface CreateSchemaOptions {
  isParameter?: boolean;
  bodySchemaName?: string;
}
export interface SchemaUtilContext extends CreateSchemaOptions {
  schema: openapi.SchemaObject;
}

export interface BodySchemaObject {
  description?: string;
  content: openapi.ContentObject;
}
