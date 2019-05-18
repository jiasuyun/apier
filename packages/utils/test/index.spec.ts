import { kindOf, ApierKind, colonToCurlybrace, omitEmptyObject, reorder } from "../src";

it("kindOf", () => {
  expect(kindOf(null)).toEqual(ApierKind.NULL);
  expect(kindOf(undefined)).toEqual(ApierKind.NULL);
  expect(kindOf(32.2)).toEqual(ApierKind.NUMBER);
  expect(kindOf(32)).toEqual(ApierKind.INTEGER);
  expect(kindOf(true)).toEqual(ApierKind.BOOLEAN);
  expect(kindOf("abc")).toEqual(ApierKind.STRING);
  expect(kindOf([1, 2])).toEqual(ApierKind.ARRAY);
  expect(kindOf({ a: 3 })).toEqual(ApierKind.OBJECT);
});

it("colonToCurlybrace", () => {
  expect(colonToCurlybrace("/model/:id")).toEqual("/model/{id}");
  expect(colonToCurlybrace("/model/:id/:ss")).toEqual("/model/{id}/{ss}");
  expect(colonToCurlybrace("/model/:id/:id")).toEqual("/model/{id}/{id}");
});

test("omitEmptyObject", () => {
  const data = [{}, { a: {}, b: 3 }, { a: {}, b: [{}, { c: {}, d: 4 }] }];
  data.forEach(v => omitEmptyObject(v));
  expect(data).toEqual([{}, { b: 3 }, { b: [{ d: 4 }] }]);
});

test("reorder", () => {
  const v = { a: 3, b: 4, c: 5, d: 6, e: 7, f: 8 };
  reorder(v, ["a", "d", "b", "c"]);
  expect(Object.keys(v)).toEqual(["e", "f", "a", "d", "b", "c"]);
  const v2 = { b: 4, c: 5, d: 6 };
  reorder(v2, ["a", "d", "b", "c"]);
  expect(Object.keys(v2)).toEqual(["d", "b", "c"]);
});
