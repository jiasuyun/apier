import Generator from '../src';
import { parse } from '@dee-contrib/apier';
import Parser from '@dee-contrib/apier-parser-json5';
import * as fs from 'fs';
import * as path from 'path';

test('parse array', () => {
  const input = fs.readFileSync(path.resolve(__dirname, `./fixtures/array.json5`), 'utf8');
  const result = parse(input, new Parser());
  const output = result.map(apier => new Generator(apier).value)
  expect(output).toEqual([]);
});

function loadJSON5(name: string): string {
  return fs.readFileSync(path.resolve(__dirname, `./fixtures/${name}.json5`), 'utf8');
}

function loadJSON(name: string): string {
  return require(path.resolve(__dirname, `./fixtures/${name}.json`));
}
