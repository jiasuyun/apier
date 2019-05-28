import Generator from "../src";
import { factory, toYaml } from "@jiasuyun/apier-test-utils-generator";

const gen = name => toYaml(factory(api => new Generator(api).value)(name));

test("generate", () => {
  expect(gen("general")).toMatchSnapshot();
});
