"use strict";

const path = require("path");
const { getPackages, resolvePackages } = require("./packageUtils");
const { execSync } = require("child_process");

const tsLintFile = path.resolve(__dirname, "../tslint.json");
const pkgs = process.argv.slice(2);

if (pkgs.length) {
  resolvePackages(pkgs).forEach(lint);
} else {
  const packages = getPackages();
  packages.forEach(lint);
}

function lint(pkgFolder) {
  const cmd = `npx tslint -c ${tsLintFile} -p tsconfig.json --fix`;
  const pkgName = path.basename(pkgFolder);
  process.stdout.write(`Linting ${pkgName}\n`)
  try {
    execSync(cmd, { cwd: pkgFolder, stdio: 'inherit' });
  } catch (err) {}
}
