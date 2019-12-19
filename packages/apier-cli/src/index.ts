#!/usr/bin/env node

import program from "commander";
import * as fs from "fs";
import * as apier from "@jiasuyun/apier";
import Parser from "@jiasuyun/apier-parser-json5";
import yaml from "js-yaml";
import merge from "lodash/merge";
import get from "lodash/get";
import { EOL } from "os";

import OpenapiGenerator from "@jiasuyun/apier-generator-openapi";
import HandlerGenerator from "@jiasuyun/apier-generator-handler";

const KINDS = ["openapi", "handler"];
program
  .usage("[options] <src> <dst>")
  .version(require("../package.json").version)
  .description("convert apier file")
  .option("-k --kind <kind>", `oneof ${KINDS.join(",")}`)
  .parse(process.argv);

let [srcFile, destFile] = program.args;

check();

try {
  execute();
} catch (err) {
  exitWithMsg(err.message);
}

function check() {
  if (KINDS.indexOf(program.kind) === -1) {
    exitWithMsg(`Error: option --kind is required, and must be one of ${KINDS.join(",")}`);
  }
  if (!fs.existsSync(srcFile)) {
    exitWithMsg(`Error: option <src> is required, and must be valid json5 file`);
  }
  if (!fs.existsSync(destFile)) {
    exitWithMsg(`Error: option <dst> is required`);
  }
}

function execute() {
  const input = fs.readFileSync(srcFile, "utf8");
  const parser = new Parser();
  const { apiers, metadata } = apier.parse(input, parser);
  let output: string;
  if (program.kind === "openapi") {
    const openapis = [];
    apiers.forEach(api => {
      openapis.push(new OpenapiGenerator(api).value);
    });
    const openapisObj = openapis.reduce((a, c) => merge(a, c), get(metadata, 'openapi.doc', {}));
    output = yamlDump(openapisObj)
  } else if (program.kind === "handler") {
    const handlers = [];
    apiers.forEach(api => {
      handlers.push(new HandlerGenerator(api).value);
    });
    output = handlers.map(toApi).join(EOL);
  }
  fs.writeFileSync(destFile, output, "utf8");
}

function yamlDump(data) {
  return yaml.dump(data)
}

function toApi(handler) {
  return `export const ${handler.name} = makeRequest("${handler.method}", "${handler.url}");`;
}

function exitWithMsg(msg: string) {
  console.log(msg + "\n");
  process.exit();
}