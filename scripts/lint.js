"use strict";

const path = require("path");
const { getPackages, resolvePackages } = require("./packageUtils");
const { execSync } = require("child_process");

const pkgs = process.argv.slice(2);

let isAllRight = true;

if (pkgs.length) {
  resolvePackages(pkgs).forEach(lint);
} else {
  const packages = getPackages();
  packages.forEach(lint);
}

if (!isAllRight) {
  process.exit(1);
}

function lint(pkgFolder) {
  const cmd = `npx eslint --ext .ts --fix --ignore-pattern dist .`;
  const pkgName = path.basename(pkgFolder);
  process.stdout.write(`Linting ${pkgName}\n`);
  try {
    execSync(cmd, { cwd: pkgFolder, stdio: "inherit" });
  } catch (err) {
    isAllRight = false;
  }
}
