import * as apier from "@jiasuyun/apier";
import Parser from "@jiasuyun/apier-parser-json5";
import { loadFixtureJSON5 } from "@jiasuyun/apier-test-utils";

export function loadApiers(name: string): apier.Apier[] {
  const input = loadFixtureJSON5(name);
  const parser = new Parser();
  return apier.parse(input, parser);
}
