import Generator from "../src";
import { factory, toYaml, mergeArray } from "@jiasuyun/apier-test-utils-generator";

const gen = name => toYaml(mergeArray(factory(api => new Generator(api).value)(name)));

test("generate", () => {
  expect(gen("general")).toMatchSnapshot();
});
