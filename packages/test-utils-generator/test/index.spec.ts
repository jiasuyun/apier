import { parse, factory, toYaml, mergeArray } from "../src";
import { loadFixtureJSON } from "@jiasuyun/apier-test-utils";

test("parse", () => {
  const result = parse("general");
  expect(result.apiers).toHaveLength(1);
  expect(result.apis).toEqual(loadFixtureJSON("general.apis"));
  const commentsJSON = loadFixtureJSON("general.comments");
  const metadataJSON = loadFixtureJSON("general.metadata");
  expect(result.comments).toEqual(commentsJSON);
  expect(result.metadata).toEqual(metadataJSON);
});

test("generateYaml", () => {
  const fn = apier => ({ [apier.name]: true });
  expect(toYaml(mergeArray(factory(fn)("user")))).toMatchSnapshot();
});
