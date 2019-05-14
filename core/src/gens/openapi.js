const { filter } = require('../comment');
const lomit = require('lodash.omit');
const lpick = require('lodash.pick');

const getOpenapi = (element, comments) => {
  let { url, method, name, req, res } = element;
  url = url.replace(/\/:([A-Za-z0-9_]+)/g, '/{$1}');
  const comment  = filter(comments, [element.name], true) || {};
  const summary = comment.summary || `接口 ${element.name}`;
  const operation = { operationId: name, summary };
  Object.assign(operation, lpick(comment,['tags', 'description', 'deprecated'] ))
  const schemas = {};
  const parameters = resolveParamters(element, comments);
  if (parameters.length > 0) {
    operation.parameters = parameters;
  }
  if (req.body) resolveRequestBody(element, comments, operation, schemas);
  if (res.body) resolveResponse(element, comments, operation, schemas);
  return { paths: { [url]: { [method]: operation } }, schemas };
}

function resolveParamters(element, comments) {
  const parameters = [];
  ['params', 'query', 'headers'].forEach(key => {
    const item = element.req[key];
    if (item) {
      Object.keys(item).forEach(name => {
        const parameter = {}
        parameter.name = name;
        parameter.in = key === 'params' ? 'path' : key;
        const comment = filter(comments, [element.name, 'req', key, name], true);
        parameter.schema = createSchema(item[name]);
        if (comment) {
          if (!comment.optional) parameter.required = true;
          const parameterFields = ['description', 'deprecated', 'allowEmptyValue', 'type']
          Object.assign(parameter, lpick(comment, parameterFields));
          Object.assign(parameter.schema, lomit(comment, [...parameterFields, 'optional']));
        }
        parameters.push(parameter);
      })
    }
  });
  return parameters;
}

function resolveRequestBody(element, comments, operation, schemas) {
  const paths = [element.name, 'req', 'body']
  const comment = filter(comments, paths, true) || {};
  const contentType = comment['contentType'] || 'application/json';
  const reqSchemaName = nameSchema(element.name, 'Request');
  const requestBody = {};
  if (comment.description) requestBody.description = comment.description;
  if (!comment.optional) requestBody.required = true;
  requestBody.content = { [contentType]: { schema: { '$ref': `#/components/schemas/${reqSchemaName}` } } }
  operation.requestBody = requestBody;
  schemas[reqSchemaName] = createSchema(element.req.body, filter(comments, paths));
}

function resolveResponse(element, comments, operation, schemas) {
  const paths = [element.name, 'res', 'body'];
  const comment = filter(comments, paths, true) || {};
  const contentType = comment['contentType'] || 'application/json';
  const resSchemaName = nameSchema(element.name, 'Response');
  const { status = 200, body } = element.res;
  const responses = {};
  if (comment.description) responses.description = comment.description;
  responses[status] = { content: { [contentType]: { schema: { '$ref': `#/components/schemas/${resSchemaName}` } } } };
  operation.responses = responses;
  schemas[resSchemaName] = createSchema(body, filter(comments, paths));
}

function nameSchema(text, tail) {
  return [text[0].toUpperCase(), ...text.slice(1), ...tail].join('')
}

function createSchema(data, comments = []) {
  const schema = {};
  schemaUtil(schema, data, comments);
  return schema;
}

function schemaUtil(schema, data, comments) {
  const kind = getKind(data);
  const comment = filter(comments, [], true) || {};
  Object.assign(schema, kind, lomit(comment, 'optional'));
  if (kind.type === 'object') {
    schema.properties = {};
    schema.required = [];
    for (const key in data) {
      const item = schema.properties[key] = {}
      if (schemaUtil(item, data[key], filter(comments, [key]))) {
        schema.required.push(key);
      }
    }
  } else if (kind.type === 'array') {
    schema.items = {};
    if (data.length > 1) {
      const anyOf = []
      schema.items = { anyOf };
      data.forEach((child, index) => {
        const childSchema = {}
        schemaUtil(childSchema, child, filter(comments, [index]));
        anyOf.push(childSchema)
      });
    } else {
      schemaUtil(schema.items, data[0], filter(comments, [0]));
    }
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