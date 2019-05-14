const fs = require('fs');
const path = require('path');
const getOpenapi = require('../../src/gens/openapi');
const yaml = require('js-yaml');

it('getHandler', () => {
  const { getModel } = require('../fixtures/apis');
  const comments = require('../fixtures/comments');
  const openapi = fs.readFileSync(path.resolve(__dirname, '../fixtures/openapi.yaml'), 'utf8');
  const data = getOpenapi(getModel, comments);
  expect(yaml.safeDump(data)).toEqual(openapi);
})

