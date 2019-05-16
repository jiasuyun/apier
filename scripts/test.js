"use strict";

const fs = require("fs");
const path = require("path");
const { getPackages, resolvePackage } = require("./packageUtils");
const { execSync } = require("child_process");

const jestConfigFile = path.resolve(__dirname, "../jest.config.js");
const args = process.argv.slice(2);

if (args.length) {
  const [pkgName, pathPattern] = args;
  const pkgFolder = resolvePackage(pkgName);
  test(pkgFolder, pathPattern);
} else {
  const packages = getPackages();
  packages.forEach(folder => test(folder));
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
  } catch (err) {}
  process.stdout.write(`\n`);
}

function existTest(pkgFolder) {
  const testFolder = path.resolve(pkgFolder, "test");
  return fs.existsSync(testFolder);
}
