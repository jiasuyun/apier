import * as apier from "@jiasuyun/apier-parser-base";
import { ApierComment } from "@jiasuyun/apier-comment";
import { ApierKind, kindOf } from "@jiasuyun/apier-utils";
import * as JSON5 from "json5";
import Visitor from "./Visitor";
import { beignLineNum } from "./helper";
import lset from "lodash/set";

// 解析 Route
const RE_ROUTE = /^(get|post|put|delete)\s[:\/A-Za-z0-9_\-]+/i;
// 判断根注释, `// @@@`
const RE_ROOT_COMMENT = /^\s*\/\/\s*@@@/;

export default class Parser implements apier.Parser {
  public parse(input: string): apier.ParseResult {
    let parsedObj: any;
    try {
      parsedObj = JSON5.parse(input);
    } catch (err) {
      throw new apier.ContentParserError(err.lineNumber, err.columnNumber, err);
    }
    const apis = {};
    for (const name in parsedObj) {
      apis[name] = this.parseApi(name, parsedObj[name]);
    }
    const comment = this.parseComment(input);
    return { apis, comment };
  }
  private parseApi(name: string, data: any): apier.ApierRaw {
    if (kindOf(data) !== ApierKind.OBJECT) {
      throw new apier.StructParserError([name], "should be object");
    }
    let api: any = { name };
    const { route, req, res } = data;
    this.parseRoute(api, route);
    this.parseReq(api, req);
    this.parseRes(api, res);
    return api as apier.ApierRaw;
  }
  private parseComment(input: string): ApierComment {
    const lines = input.split("\n");
    const comment = new ApierComment();
    const root = new Visitor(lines, comment, []);
    const beginLineIndex = beignLineNum(lines);
    this.parserRootComment(comment, lines.slice(0, beginLineIndex));
    root.scopeObject(beginLineIndex + 1);
    return comment;
  }
  private parserRootComment(comment: ApierComment, lines: string[]) {
    const paths = [];
    for (let line of lines) {
      const match = RE_ROOT_COMMENT.exec(line);
      if (!match) {
        continue;
      }
      comment.append(paths, line.slice(match[0].length));
    }
  }
  private parseRoute(api: apier.ApierRaw, route: string) {
    if (!RE_ROUTE.test(route)) {
      throw new apier.StructParserError([api.name, "route"], route);
    }
    const [method, url] = route.split(" ");
    api.method = method.toLowerCase() as apier.Method;
    api.url = url;
  }

  private parseReq(api: apier.ApierRaw, req) {
    if (req === undefined) return;
    if (kindOf(req) !== ApierKind.OBJECT) {
      throw new apier.StructParserError([api.name, "req"], "must be object");
    }
    const { headers, params, query, body } = req;
    api.req = {};
    if (headers) this.parseParameters(api, ["req", "headers"], headers);
    if (params) this.parseParameters(api, ["req", "params"], params);
    if (query) this.parseParameters(api, ["req", "query"], query);
    if (body) this.parseBody(api, ["req", "body"], body);
  }

  private parseRes(api: apier.ApierRaw, res) {
    api.res = { status: 200 };
    if (res === undefined) {
      return;
    }
    if (kindOf(res) !== ApierKind.OBJECT) {
      throw new apier.StructParserError([api.name, "res"], "must be object");
    }
    const { status, body } = res;
    if (status) this.parseResStatus(api, status);
    if (body) this.parseBody(api, ["res", "body"], body);
  }

  private parseParameters(api, paths, obj) {
    if (typeof obj !== "object") {
      throw new apier.StructParserError([api.name, ...paths], `must be object`);
    }
    for (const key in obj) {
      const value = obj[key];
      const valueKind = kindOf(value);
      if (valueKind === ApierKind.ARRAY || valueKind === ApierKind.OBJECT) {
        throw new apier.StructParserError([api.name, ...paths, key], `must be scalar value`);
      }
    }
    lset(api, paths, obj);
  }

  private parseResStatus(api, status = 200) {
    if (typeof status !== "number" && (status < 100 && status >= 600)) {
      throw new apier.StructParserError([name, "res", "status"], `{status}`);
    }
    api.res.status = status;
  }

  private parseBody(api, paths, body) {
    lset(api, paths, body);
  }
}
