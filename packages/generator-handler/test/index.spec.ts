import * as apier from "@jiasuyun/apier";
import Generator from "../src";
import { factory } from "@jiasuyun/apier-test-utils-generator";

const gen = factory((api: apier.Apier) => new Generator(api).value);

test("generate", () => {
  expect(gen("general").join("\n")).toMatchSnapshot();
});
