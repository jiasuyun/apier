const fs = require('fs');
const path = require('path');
const getHtte = require('../../src/gens/htte');
const yaml = require('js-yaml');

it('getHandler', () => {
  const { getModel } = require('../fixtures/apis');
  const comments = require('../fixtures/comments');
  const htte = fs.readFileSync(path.resolve(__dirname, '../fixtures/htte.yaml'), 'utf8');
  const data = getHtte(getModel, comments);
  expect(yaml.safeDump([data])).toEqual(htte);
})
