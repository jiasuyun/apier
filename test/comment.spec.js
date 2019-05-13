const fs = require('fs');
const path = require('path');

const { parse, connect } = require('../src/comment');
const { _getLineComment, _getLineKind } = require('../src/comment');

it('getLineKind', () => {
  [
    [`foo: [`, { type: 'array', key: 'foo' }],
    [`foo: [ // abc`, { type: 'array', key: 'foo' }],
    [` foo:[ `, { type: 'array', key: 'foo' }],
    [`foo: {`, { type: 'object', key: 'foo' }],
    [`foo: 'bar'`, { type: 'kv', key: 'foo' }],
    [`'foo':"bar"`, { type: 'kv', key: 'foo' }],
    [`'foo':"bar",`, { type: 'kv', key: 'foo' }],
    [`'foo':"bar" , // abc`, { type: 'kv', key: 'foo' }],
    [`{`, { type: 'object' }],
    [`//`, { type: 'empty' }],
    [`// foo`, { type: 'empty' }],
    [` `, { type: 'empty' }],
    [`}`, { type: 'exit' }],
    [`} ,`, { type: 'exit' }],
    [`]`, { type: 'exit' }],
    [`],`, { type: 'exit' }],
    [`] ,`, { type: 'exit' }],
    [`] , // abc`, { type: 'exit' }],
    [` { a: 3, b: 4 } `, { type: 'empty' }],
    [` [ 1, 2, 3 ] `, { type: 'empty' }],
    [`"foo": [`, { type: 'array', key: 'foo' }],
    [`  'foo': [  `, { type: 'array', key: 'foo' }],
  ].forEach(([input, output]) => {
    expect(_getLineKind(input, 0)).toEqual(output);
  });
});

it('getLineComment', () => {
  [
    [` "integer": 32, // format=int64`, { format: 'int64' }],
    [` { // optional pattern=[abc]+ description="xx xx"`, { pattern: '[abc]+', optional: true, description: 'xx xx' }],
    [` { //description='xx"C" xx'`, { description: 'xx"C" xx' }],
    [` "integer": 32, // `, undefined],
    [` "integer": 32, `, undefined],
  ].forEach(([input, output]) => {
    expect(_getLineComment(input)).toEqual(output);
  });
});

it('parse', () => {
  const demoInput = fs.readFileSync(path.resolve(__dirname, 'fixtures/demo.json5'), 'utf8');
  const lines = demoInput.split('\n');
  const comments = parse(lines);
  expect(comments).toEqual(require('./fixtures/comments'));
});