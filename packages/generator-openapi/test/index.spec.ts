import Generator from "../src";
import { loadApiers } from "@jiasuyun/apier-test-utils-generator";

test("generate", () => {
  const apier = loadApiers("general")[0];
  const generator = new Generator(apier);
  expect(generator.value).toMatchSnapshot();
});

test("generate: array", () => {
  const apier = loadApiers("array")[0];
  const generator = new Generator(apier);
  expect(generator.value).toMatchSnapshot();
});

test("genereate: saveSchema and safeSchema", () => {
  const apier = loadApiers("useSchema")[0];
  const generator = new Generator(apier);
  expect(generator.value).toMatchSnapshot();
});
