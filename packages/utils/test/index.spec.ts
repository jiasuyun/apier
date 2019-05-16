import { kindOf, ApierKind, colonToCurlybrace } from '../src';

it('kindOf', () => {
  expect(kindOf(null)).toEqual(ApierKind.NULL);
  expect(kindOf(undefined)).toEqual(ApierKind.NULL);
  expect(kindOf(32.2)).toEqual(ApierKind.NUMBER);
  expect(kindOf(32)).toEqual(ApierKind.INTEGER);
  expect(kindOf(true)).toEqual(ApierKind.BOOLEAN);
  expect(kindOf('abc')).toEqual(ApierKind.STRING);
  expect(kindOf([1,2])).toEqual(ApierKind.ARRAY);
  expect(kindOf({ a: 3 })).toEqual(ApierKind.OBJECT);
});

it('colonToCurlybrace', () => {
  expect(colonToCurlybrace('/model/:id')).toEqual('/model/{id}');
  expect(colonToCurlybrace('/model/:id/:ss')).toEqual('/model/{id}/{ss}');
  expect(colonToCurlybrace('/model/:id/:id')).toEqual('/model/{id}/{id}');
})