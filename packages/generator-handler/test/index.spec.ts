import * as apier from "@jiasuyun/apier";
import Generator from "../src";
import { toYaml, factory } from "@jiasuyun/apier-test-utils-generator";

const gen = name => toYaml(factory((api: apier.Apier) => new Generator(api).value)(name));

test("generate", () => {
  expect(gen("general")).toMatchSnapshot();
});

test("expect(generate: real example)", () => {
  expect(gen("user")).toMatchSnapshot();
});
