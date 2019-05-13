const fs = require('fs');
const path = require('path');

const { parse, connect } = require('../src/comment');
const { _getLineComment, _getLineKind } = require('../src/comment');

it('getLineKind', () => {
  [
    [`foo: [`, { type: 'array', key: 'foo' }],
    [`foo: {`, { type: 'object', key: 'foo' }],
    [`foo: 'bar'`, { type: 'kv', key: 'foo' }],
    [`{`, { type: 'object' }],
    [`//`, { type: 'empty' }],
    [` `, { type: 'empty' }],
    [`}`, { type: 'exit' }],
    [`]`, { type: 'exit' }],
    [`"foo": [`, { type: 'array', key: 'foo' }],
    [`  'foo': [  `, { type: 'array', key: 'foo' }],
  ].forEach(([input, output]) => {
    expect(_getLineKind(input)).toEqual(output);
  });
});

it('getLineComment', () => {
  [
    [` "integer": 32, // format=int64`, { format: 'int64' }],
    [` { // optional pattern=[abc]+ description="xx xx"`, { pattern: '[abc]+', optional: true, description: 'xx xx' }],
    [` { //description='xx"C" xx'`, { description: 'xx"C" xx' }],
  ].forEach(([input, output]) => {
    expect(_getLineComment(input)).toEqual(output);
  });
});

it('parse', () => {
  const demoInput = fs.readFileSync(path.resolve(__dirname, 'fixtures/demo.json5'));
  const lines = demoInput.split('\n');
  const comments = parse(lines);
  const output = [
    {
      paths: ['$','getModel','route'],
      comment: { security: null },
    },
    {
      paths: ['$', 'getModel', 'req', 'query', 'pageSize'],
      comment: { maximum: 10 },
    },
    // FIXME more
  ];
  expect(comments).toEqual(output);
});