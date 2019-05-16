import Parser from "../src";
import { loadFixtureJSON5, loadFixtureJSON } from "@jiasuyun/apier-test-utils";

describe("Parser", () => {
  it("parse", () => {
    const input = loadFixtureJSON5("general");
    const parser = new Parser();
    const { apis, comment } = parser.parse(input);
    expect(apis).toEqual(loadFixtureJSON("general.apis"));
    expect(comment.comments).toEqual(loadFixtureJSON("general.comments"));
  });
});
