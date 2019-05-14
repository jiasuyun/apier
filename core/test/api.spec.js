const fs = require('fs');
const path = require('path');

const { parse } = require('../src/api');

it('parse', () => {
  const demoInput = fs.readFileSync(path.resolve(__dirname, 'fixtures/demo.json5'), 'utf8');
  const apis = parse(demoInput);
  expect(apis).toEqual(require('./fixtures/apis'));
});