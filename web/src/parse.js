import * as apier from '@jiasuyun/apier';
import Parser from '@jiasuyun/apier-parser-json5';
import yaml from 'js-yaml';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { stringify } from 'javascript-stringify';

import OpenapiGenerator from '@jiasuyun/apier-generator-openapi';
import HtteGenerator from '@jiasuyun/apier-generator-htte';
import HandlerGenerator from '@jiasuyun/apier-generator-handler';

const SPACE = 2;
const EOL = '\n';

export default function parse(input) {
  const parser = new Parser();
  const { apiers, metadata } = apier.parse(input, parser);
  const handlers = [];
  const htteTests = [];
  const htteDefines = {};
  const openapis = [];
  apiers.forEach(api => {
    handlers.push(new HandlerGenerator(api).value);
    const { test, define } = new HtteGenerator(api).value;
    htteTests.push(test);
    merge(htteDefines, define);
    openapis.push(new OpenapiGenerator(api).value);
  });
  const openapisObj = openapis.reduce((a, c) => merge(a, c), get(metadata, 'openapi.doc', {}));

  const htteTestsText = yaml.safeDump(htteTests);
  const htteDefinesText = yaml.safeDump({ defines: htteDefines });
  const openapisText = yaml.safeDump(openapisObj)
  const apisText = handlers.map(toApi).join(EOL);
  const mocksText = `export default {${EOL}${handlers.map(toMock).join(EOL)}${EOL}};`
  return { apisText, mocksText, htteTestsText, openapisText, htteDefinesText, openapisObj };
}

function toApi(handler) {
  return `export const ${handler.name} = makeRequest("${handler.method}", "${handler.url}");`;
}

function toMock(handler) {
  let dataText = stringify(handler.data, null, SPACE);
  dataText = dataText.split('\n').map((line, index) => {
    if (index === 0) {
      return line;
    }
    return space(SPACE) + line;
  }).join(EOL);
  const keyText = `${space(SPACE)}'${handler.method} ${handler.url}'`;
  if (!handler.useMock) {
    return `${keyText}: ${dataText},`;
  }
  return `${keyText}: createMockData(${dataText}),`;
}

function space(n) {
  return ' '.repeat(n);
}