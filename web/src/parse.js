import * as apier from '@jiasuyun/apier';
import Parser from '@jiasuyun/apier-parser-json5';
import yaml from 'js-yaml';
import merge from 'lodash/merge';
import get from 'lodash/get';

import OpenapiGenerator from '@jiasuyun/apier-generator-openapi';
import HtteGenerator from '@jiasuyun/apier-generator-htte';
import HandlerGenerator from '@jiasuyun/apier-generator-handler';

export default function parse(input) {
  const parser = new Parser();
  const { apiers, metadata } = apier.parse(input, parser);
  const handlers = [];
  const httes = [];
  const openapis = [];
  apiers.forEach(api => {
    handlers.push(new HandlerGenerator(api).value);
    httes.push(new HtteGenerator(api).value);
    openapis.push(new OpenapiGenerator(api).value);
  });

  const handlersText = handlers.join('\n\n');
  const httesText = yaml.safeDump(httes);
  const openapisText = yaml.safeDump(openapis.reduce((a, c) => merge(a, c), get(metadata, 'openapi.doc', {})))
  return { handlersText, httesText, openapisText };
}