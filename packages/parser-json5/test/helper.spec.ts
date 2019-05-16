import { valueOfLine, beignLineNum, getLineComment } from "../src/helper";

it("valueOfLine", () => {
  expect(valueOfLine(`foo: [`)).toEqual({ kind: "array", key: "foo" });
  expect(valueOfLine(`foo: [ // abc`)).toEqual({ kind: "array", key: "foo" });
  expect(valueOfLine(` foo:[ `)).toEqual({ kind: "array", key: "foo" });
  expect(valueOfLine(`foo: {`)).toEqual({ kind: "object", key: "foo" });
  expect(valueOfLine(`foo: 'bar'`)).toEqual({ kind: "kv", key: "foo" });
  expect(valueOfLine(`'foo':"bar"`)).toEqual({ kind: "kv", key: "foo" });
  expect(valueOfLine(`'foo':"bar",`)).toEqual({ kind: "kv", key: "foo" });
  expect(valueOfLine(`'foo':"bar" , // abc`)).toEqual({
    kind: "kv",
    key: "foo"
  });
  expect(valueOfLine(`{`)).toEqual({ kind: "object" });
  expect(valueOfLine(`//`)).toEqual({ kind: "empty" });
  expect(valueOfLine(`// foo`)).toEqual({ kind: "empty" });
  expect(valueOfLine(` `)).toEqual({ kind: "empty" });
  expect(valueOfLine(`}`)).toEqual({ kind: "exit" });
  expect(valueOfLine(`} ,`)).toEqual({ kind: "exit" });
  expect(valueOfLine(`]`)).toEqual({ kind: "exit" });
  expect(valueOfLine(``)).toEqual({ kind: "empty" });
  expect(valueOfLine(`] ,`)).toEqual({ kind: "exit" });
  expect(valueOfLine(`] , // abc`)).toEqual({ kind: "exit" });
  expect(valueOfLine(` { a: 3, b: 4 } `)).toEqual({ kind: "empty" });
  expect(valueOfLine(` [ 1, 2, 3 ] `)).toEqual({ kind: "empty" });
  expect(valueOfLine(`"foo": [`)).toEqual({ kind: "array", key: "foo" });
  expect(valueOfLine(`  'foo': [  `)).toEqual({ kind: "array", key: "foo" });
});

it("beignLineNum", () => {
  expect(
    beignLineNum(
      `// comment 1
  // comment2
  {
  `.split("\n")
    )
  ).toEqual(2);
});

it("getLineComment", () => {
  expect(getLineComment(`foo: [ // k=v k2=v2`)).toEqual("k=v k2=v2");
  expect(getLineComment(`foo: { // k=v k2=v2`)).toEqual("k=v k2=v2");
  expect(getLineComment(`foo: 'bar', // k=v k2=v2`)).toEqual("k=v k2=v2");
  expect(getLineComment(`} // k=v k2=v2`)).toEqual("");
  expect(getLineComment(`] // k=v k2=v2`)).toEqual("");
  expect(getLineComment(`// k=v k2=v2`)).toEqual("");
  expect(getLineComment(``)).toEqual("");
});
