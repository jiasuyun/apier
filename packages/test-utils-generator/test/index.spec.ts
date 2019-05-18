import { parse, factory } from "../src";
import { loadFixtureJSON } from "@jiasuyun/apier-test-utils";

test("parse", () => {
  const result = parse("general");
  expect(result.apiers).toHaveLength(1);
  expect(result.apis).toEqual(loadFixtureJSON("general.apis"));
  const commentsJSON = loadFixtureJSON("general.comments");
  expect(result.comments).toEqual(commentsJSON);
  expect(result.metadata).toEqual(commentsJSON[0].comment);
});

test("generateYaml", () => {
  const fn = apier => ({ [apier.name]: true });
  expect(factory(fn)("user")).toMatchSnapshot();
});
