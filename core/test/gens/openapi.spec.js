const fs = require('fs');
const path = require('path');
const getOpenapi = require('../../src/gens/openapi');
const yaml = require('js-yaml');
const { filter } = require('../../src/comment');

it('getHandler', () => {
  const { getModel } = require('../fixtures/apis');
  const comments = require('../fixtures/comments');
  const openapi = fs.readFileSync(path.resolve(__dirname, '../fixtures/openapi.yaml'), 'utf8');
  const data = getOpenapi(getModel, filter(comments, ['getModel']));
  expect(yaml.safeDump(data)).toEqual(openapi);
})

