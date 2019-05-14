const getHandler = require('./gens/handler');
const getOpenapi = require('./gens/openapi');
const getHtte = require('./gens/htte');
const { parse: parseApi } = require('./api');
const { parse: parseComment, filter } = require('./comment');

function parse(input, options) {
  const apis = parseApi(input);
  const allComents = parseComment(input);
  const output = { handlers: [], httes: [], openapis: [] };
  for (const name in apis) {
    const element = apis[name];
    const comments = filter(allComents, [name]);
    const handler = getHandler(element);
    const htte = getHtte(element, comments);
    const openapi = getOpenapi(element, comments)
    output.handlers.push(handler);
    output.httes.push(htte);
    output.openapis.push(openapi);
  }
  return output;
}