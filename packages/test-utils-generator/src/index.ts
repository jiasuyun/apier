import * as apier from '@dee-contrib/apier';
import Parser from "@dee-contrib/apier-parser-json5";
import { loadFixtureJSON5 } from '@dee-contrib/apier-test-utils';

export function loadApiers(name: string): apier.Apier[] {
  const input = loadFixtureJSON5(name);
  const parser = new Parser();
  return apier.parse(input, parser);
}

