"use strict";

const fs = require("fs");
const path = require("path");
const { getPackages, resolvePackage } = require("./packageUtils");
const { execSync } = require("child_process");

const jestConfigFile = path.resolve(__dirname, "../jest.config.js");
const args = process.argv.slice(2);

let isAllRight = true;

if (args.length) {
  const [pkgName, pathPattern] = args;
  const pkgFolder = resolvePackage(pkgName);
  test(pkgFolder, pathPattern);
} else {
  const packages = getPackages();
  packages.forEach(folder => test(folder));
}

if (!isAllRight) {
  process.exit(1);
}

function test(pkgFolder, pathPattern) {
  if (!existTest(pkgFolder)) return;
  const cmd = `npx jest --rootDir ${pkgFolder} -c ${jestConfigFile} ${
    pathPattern ? "--testPathPattern " + pathPattern : ""
  }`;
  const pkgName = path.basename(pkgFolder);
  process.stdout.write(`Testing ${pkgName}\n\n`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    isAllRight = false;
  }
  process.stdout.write(`\n`);
}

function existTest(pkgFolder) {
  const testFolder = path.resolve(pkgFolder, "test");
  return fs.existsSync(testFolder);
}
