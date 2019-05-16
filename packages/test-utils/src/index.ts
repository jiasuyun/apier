import * as fs from 'fs';
import * as path from 'path';

export function loadFixtureJSON5(name: string): string {
  return fs.readFileSync(path.resolve(__dirname, `../src/fixtures/${name}.json5`), 'utf8');
}

export function loadFixtureJSON(name: string): any {
  return require(path.resolve(__dirname, `../src/fixtures/${name}.json`));
}