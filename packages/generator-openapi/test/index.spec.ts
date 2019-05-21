import Generator from "../src";
import { factory, mergeArray, toYaml } from "@jiasuyun/apier-test-utils-generator";

const gen = name => toYaml(mergeArray(factory(api => new Generator(api).value)(name)));

test("generate", () => {
  expect(gen("general")).toMatchSnapshot();
});

test("expect(generate: array)", () => {
  expect(gen("array")).toMatchSnapshot();
});

test("expect(genereate: useSchema)", () => {
  expect(gen("useSchema")).toMatchSnapshot();
});

test("expect(generate: real example)", () => {
  expect(gen("user")).toMatchSnapshot();
});

test("expect(generate: mutiple res)", () => {
  expect(gen("multiRes")).toMatchSnapshot();
});