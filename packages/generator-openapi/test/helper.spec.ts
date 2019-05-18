import { omitEmptyObject } from "../src/helper";

test("omitEmptyObject", () => {
  expect(omitEmptyObject({})).toEqual({});
  expect(omitEmptyObject({ a: {}, b: 3 })).toEqual({ b: 3 });
  expect(omitEmptyObject({ a: {}, b: [{}, { c: {}, d: 4 }] })).toEqual({ b: [{ d: 4 }] });
});
