import * as parser from "@jiasuyun/apier-parser-base";
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

export default class Parser implements parser.Parser {
  private markResIsSignle: { [k: string]: boolean } = {};
  public parse(input: string): parser.ParseResult {
    let parsedObj: any;
    try {
      parsedObj = JSON5.parse(input);
    } catch (err) {
      throw new parser.ContentParserError(err.lineNumber, err.columnNumber, err);
    }
    const comment = this.parseComment(input);
    const apis = {};
    for (const name in parsedObj) {
      apis[name] = this.parseApi(name, parsedObj[name]);
      if (this.markResIsSignle[name]) {
        comment.changePaths([name, "res"], [name, "res", "0"]);
      }
    }
    return { apis, comment };
  }
  private parseApi(name: string, data: any): parser.ApierRaw {
    if (kindOf(data) !== ApierKind.OBJECT) {
      throw new parser.StructParserError([name], "should be object");
    }
    let api: any = { name };
    const { route, req, res } = data;
    this.parseRoute(api, route);
    this.parseReq(api, req);
    this.markResIsSignle[name] = this.parseRes(api, res);
    return api as parser.ApierRaw;
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
  private parseRoute(api: parser.ApierRaw, route: string) {
    if (!RE_ROUTE.test(route)) {
      throw new parser.StructParserError([api.name, "route"], route);
    }
    const [method, url] = route.split(" ");
    api.method = method.toLowerCase() as parser.Method;
    api.url = url;
  }

  private parseReq(api: parser.ApierRaw, req) {
    if (req === undefined) return;
    if (kindOf(req) !== ApierKind.OBJECT) {
      throw new parser.StructParserError([api.name, "req"], "must be object");
    }
    const { headers, params, query, body } = req;
    api.req = {};
    if (headers) this.parseParameters(api, ["req", "headers"], headers);
    if (params) this.parseParameters(api, ["req", "params"], params);
    if (query) this.parseParameters(api, ["req", "query"], query);
    if (body) this.parseBody(api, ["req", "body"], body);
  }

  private parseRes(api: parser.ApierRaw, res: any) {
    let isSingleRes = true;
    if (res === undefined) {
      api.res = [{ status: 200 }];
      return isSingleRes;
    }
    const kind = kindOf(res);
    if (kind === ApierKind.OBJECT) {
      this.parseSingleRes(api, res, 0);
    } else if (kind === ApierKind.ARRAY) {
      res.forEach((v, i) => this.parseSingleRes(api, v, i));
      isSingleRes = false;
    } else {
      throw new parser.StructParserError([api.name, "res"], "must be array or object");
    }
    return isSingleRes;
  }

  private parseSingleRes(api: parser.ApierRaw, res: any, index: number) {
    let paths = ["res", "" + index];
    if (kindOf(res) !== ApierKind.OBJECT) {
      throw new parser.StructParserError(paths, "must be object");
    }
    const { status = 200, body } = res;
    if (status) this.parseResStatus(api, paths.concat("status"), status);
    if (body) this.parseBody(api, paths.concat("body"), body);
  }

  private parseParameters(api: parser.ApierRaw, paths: string[], obj: any) {
    if (typeof obj !== "object") {
      throw new parser.StructParserError([api.name, ...paths], `must be object`);
    }
    for (const key in obj) {
      const value = obj[key];
      const valueKind = kindOf(value);
      if (valueKind === ApierKind.ARRAY || valueKind === ApierKind.OBJECT) {
        throw new parser.StructParserError([api.name, ...paths, key], `must be scalar value`);
      }
    }
    lset(api, paths, obj);
  }

  private parseResStatus(api: parser.ApierRaw, paths: string[], status = 200) {
    if (typeof status !== "number" && (status < 100 && status >= 600)) {
      throw new parser.StructParserError([api.name, ...paths], `{status}`);
    }
    lset(api, paths, status);
  }

  private parseBody(api: parser.ApierRaw, paths: string[], body: any) {
    lset(api, paths, body);
  }
}
