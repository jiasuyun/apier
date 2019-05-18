import * as apier from "@jiasuyun/apier";
import Parser from "@jiasuyun/apier-parser-json5";
import { loadFixtureJSON5 } from "@jiasuyun/apier-test-utils";
import yaml from "js-yaml";
import merge from "lodash/merge";

export function parse(name: string): apier.ParseResult {
  const input = loadFixtureJSON5(name);
  const parser = new Parser();
  return apier.parse(input, parser);
}

export function toYaml(data: any): string {
  return yaml.safeDump(data);
}

export type GenerateFn = (apier: apier.Apier) => any;

export function factory(fn: GenerateFn) {
  return (name: string) => {
    const input = parse(name);
    return input.apiers.map(a => fn(a));
  };
}

export function mergeArray(arr: string[]) {
  return arr.reduce((a, c) => merge(a, c), {});
}
