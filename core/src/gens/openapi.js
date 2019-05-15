const { filter } = require('../comment');
const lomit = require('lodash.omit');
const lpick = require('lodash.pick');

const getOpenapi = (element, comments) => {
  let { url, method, name, req, res } = element;
  url = url.replace(/\/:([A-Za-z0-9_]+)/g, '/{$1}');
  const schemas = {};
  const comment = filter(comments, [], true) || {};
  const summary = comment.summary || `接口 ${element.name}`;
  const operation = { operationId: name, summary };
  Object.assign(operation, lpick(comment, ['tags', 'description', 'deprecated', 'security']))
  const parameters = resolveParamters(element, comments, schemas);
  if (parameters.length > 0) {
    operation.parameters = parameters;
  }
  if (req.body) resolveRequestBody(element, comments, operation, schemas);
  if (res.body) resolveResponse(element, comments, operation, schemas);
  return { paths: { [url]: { [method]: operation } }, components: { schemas } };
}

function resolveParamters(element, comments, schemas) {
  const parameters = [];
  ['params', 'query', 'headers'].forEach(key => {
    const item = element.req[key];
    if (item) {
      Object.keys(item).forEach(name => {
        const parameter = {}
        const comment = filter(comments, ['req', key, name], true) || {};
        if (comment.useSchema) {
          parameters.push({ ['$ref']: `#/components/schemas/${comment.useSchema}` });
          return;
        }
        parameter.name = name;
        parameter.in = key === 'params' ? 'path' : key;
        const parameterFields = ['description', 'deprecated', 'allowEmptyValue']
        parameter.schema = createSchema(schemas, item[name], [{ comment: lomit(comment, [...parameterFields, 'description', 'optional', 'saveSchema']), paths: [] }]);
        Object.assign(parameter, lpick(comment, parameterFields));
        if (!comment.optional) parameter.required = true;
        if (comment.saveSchema) {
          schemas[comment.saveSchema] = parameter;
          parameters.push({ ['$ref']: `#/components/schemas/${comment.saveSchema}` });
          return;
        }
        parameters.push(parameter);
      })
    }
  });
  return parameters;
}

function resolveRequestBody(element, comments, operation, schemas) {
  const paths = ['req', 'body']
  const comment = filter(comments, paths, true) || {};
  const requestBody = {};
  if (comment.description) requestBody.description = comment.description;
  if (!comment.optional) requestBody.required = true;
  if (comment.useSchema) {
    requestBody.content = { [contentType]: { schema: { '$ref': `#/components/schemas/${comment.useSchema}` } } }
    return;
  }
  const contentType = comment['contentType'] || 'application/json';
  const reqSchemaName = comment.saveSchema || nameSchema(element.name, 'Request');
  requestBody.content = { [contentType]: { schema: { '$ref': `#/components/schemas/${reqSchemaName}` } } }
  operation.requestBody = requestBody;
  schemas[reqSchemaName] = createSchema(schemas, element.req.body, filter(comments, paths));
}

function resolveResponse(element, comments, operation, schemas) {
  const paths = ['res', 'body'];
  const comment = filter(comments, paths, true) || {};
  const { status = 200, body } = element.res;
  const responses = { [status]: {} };
  responses[status].description = comment.description || 'SUCCESS';
  const contentType = comment['contentType'] || 'application/json';
  if (comment.useSchema) {
    responses[status].content = { [contentType]: { schema: { '$ref': `#/components/schemas/${comment.useSchema}` } } };
    return;
  }
  const resSchemaName = comment.saveSchema || nameSchema(element.name, 'Response');
  responses[status].content = { [contentType]: { schema: { '$ref': `#/components/schemas/${resSchemaName}` } } };
  operation.responses = responses;
  schemas[resSchemaName] = createSchema(schemas, body, filter(comments, paths));
}

function nameSchema(text, tail) {
  return [text[0].toUpperCase(), ...text.slice(1), ...tail].join('')
}

function createSchema(schemas, data, comments = []) {
  const schema = {};
  schemaUtil(schemas, schema, data, comments);
  return schema;
}

function schemaUtil(globalSchemas, schema, data, comments) {
  const kind = getKind(data);
  const comment = filter(comments, [], true) || {};
  if (comment.useSchema) {
    schema['$ref'] = `#/components/schemas/${comment.useSchema}`
    if (!comment.optional) return true;
  }
  Object.assign(schema, kind, lomit(comment, ['optional', 'contentType', 'array', 'saveSchema']));
  if (kind.type === 'object') {
    schema.properties = {};
    const required = [];
    for (const key in data) {
      const item = schema.properties[key] = {}
      if (schemaUtil(globalSchemas, item, data[key], filter(comments, [key]))) {
        required.push(key);
      }
    }
    if (required.length > 0) schema.required = required;
  } else if (kind.type === 'array') {
    schema.items = {};
    if (data.length > 1) {
      if (comment.array === 'first') {
        schemaUtil(globalSchemas, schema.items, data[0], filter(comments, [0]));
      } else if (comment.array === 'all') {
        let allRequired = [];
        let allProperties = {};
        data.forEach((child, index) => {
          const childSchema = {}
          schemaUtil(globalSchemas, childSchema, child, filter(comments, [index]));
          if (!childSchema.type === 'object') return;
          allRequired = [...allRequired, ...childSchema.required];
          allProperties = { ...allProperties, ...childSchema.properties };
        });
        schema.items.type = 'object';
        schema.items.properties = allProperties;
        const required = [];
        allRequired.sort().reduce((a, c) => {
          if (c === a.prev) {
            a.count++;
            if (a.count === data.length) {
              required.push(c);
            }
            return a;
          } else {
            return { prev: c, count: 1 }
          }
        }, { prev: '', count: 0 });
        if (required.length > 0) schema.items.required = required;
      } else {
        const anyOf = []
        schema.items = { anyOf };
        data.forEach((child, index) => {
          const childSchema = {}
          schemaUtil(globalSchemas, childSchema, child, filter(comments, [index]));
          anyOf.push(childSchema)
        });
      }
    } else {
      schemaUtil(globalSchemas, schema.items, data[0], filter(comments, [0]));
    }
  }
  if (comment.saveSchema) {
    globalSchemas[comment.saveSchema] = {...schema};
    Object.keys(schema).forEach(key => delete schema[key]); // clear
    schema['$ref'] = `#/components/schemas/${comment.saveSchema}`
  }
  if (!comment.optional) return true;
}

function getKind(data) {
  if (data === null) {
    return { type: 'null' };
  } else if (typeof data === "number") {
    if (Number.isInteger(data)) {
      return { type: 'integer' };
    }
    return { type: 'number' }
  } else if (typeof data === "object") {
    if (Array.isArray(data)) {
      return { type: 'array' };
    }
    return { type: 'object' };
  }
  return { type: typeof data };
}

module.exports = getOpenapi;