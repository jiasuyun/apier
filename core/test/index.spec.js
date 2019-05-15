const fs = require('fs');
const path = require('path');

const parse = require('../src');

it('parse', () => {
  const apiInput = fs.readFileSync(path.resolve(__dirname, 'fixtures/api.json5'), 'utf8');
  const output = parse(apiInput);
  expect(output).toEqual(require('./fixtures/api.json'));
});
