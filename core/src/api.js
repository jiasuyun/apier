const JSON5 = require('json5');
const lset = require('lodash.set');

/**
 *  输入字符串，输出规整的接口对象
 * @returns {API}
 */

function parse(input) {
  const parsed = JSON5.parse(input);
  const apis = {};
  for (const name in parsed) {
    apis[name] = parseAPI(name, parsed[name]);
  }
  return apis;
}

function parseAPI(name, parsed) {
  const api = { name };
  const { route, req, res } = parsed;
  parseRoute(api, route);
  if (req) parseReq(api, req);
  if (res) parseRes(api, res);
  return api;
}

function parseRoute(api, route) {
  const re = /^(get|post|put|update|delete)\s[:\/A-Za-z0-9_\-]+/i;
  if (!re.test(route)) {
    throw new Error(`${api.name}.route: "${route}"`);
  }
  const [method, url] = route.split(' ');
  api.method = method.toLowerCase();
  api.url = url;
}

function parseReq(api, req) {
  const { headers, params, query, body } = req;
  api.req = {}
  if (headers) parseStrKV(api, ['req', 'headers'], headers);
  if (params) parseStrKV(api, ['req', 'params'], params);
  if (query) parseStrKV(api, ['req', 'query'], query);
  if (body) parseBody(api, ['req', 'body'], body);
}

function parseRes(api, res) {
  const { status, body } = res;
  api.res = {}
  if (status) parseResStatus(api, status);
  if (body) parseBody(api, ['res', 'body'], body);
}

function parseStrKV(api, paths, obj) {
  if (typeof obj !== "object") {
    throw new Error(`: ${field} must be object`);
  }
  for(const key in obj) {
    const value = obj[key];
    if (typeof value !== "number" && typeof value !== "string" ) {
      throw new Error(`${api.name}.${paths.join('.')}: "${value}" must be string or number`);
    }
  }
  lset(api, paths, obj);
}

function parseResStatus(api, status) {
  if (typeof status !== "number" && (status < 100 && status >= 600)) {
      throw new Error(`${api.name}.res.status}: "${status}"`);
  }
  api.res.status = status;
}

function parseBody(api, paths, body) {
  lset(api, paths, body);
}

module.exports = {
  parse
};