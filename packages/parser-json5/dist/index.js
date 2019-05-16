"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apier = __importStar(require("@dee-contrib/apier"));
const apier_comment_1 = require("@dee-contrib/apier-comment");
const apier_utils_1 = require("@dee-contrib/apier-utils");
const JSON5 = __importStar(require("json5"));
const helper_1 = require("./helper");
const lset = __importStar(require("lodash.set"));
const Visitor_1 = __importDefault(require("./Visitor"));
// 解析 Route
const RE_ROUTE = /^(get|post|put|delete)\s[:\/A-Za-z0-9_\-]+/i;
class Parser {
    parse(input) {
        let parsedObj;
        try {
            parsedObj = JSON5.parse(input);
        }
        catch (err) {
            throw new apier.ParserError([], err.message);
        }
        const apis = {};
        for (const name in parsedObj) {
            apis[name] = this.parseApi(name, parsedObj[name]);
        }
        return { apis, comment: this.parseComment(input) };
    }
    parseApi(name, data) {
        if (apier_utils_1.kindOf(data) !== apier_utils_1.ApierKind.OBJECT) {
            throw new apier.ParserError([name], 'should be object');
        }
        let api = { name };
        const { route, req, res } = data;
        this.parseRoute(api, route);
        this.parseReq(api, req);
        this.parseRes(api, res);
        return api;
    }
    parseComment(input) {
        const lines = input.split('\n');
        const comment = new apier_comment_1.ApierComment();
        const root = new Visitor_1.default(lines, comment, []);
        root.scopeObject(helper_1.beignLineNum(lines) + 1);
        return comment;
    }
    parseRoute(api, route) {
        if (!RE_ROUTE.test(route)) {
            throw new apier.ParserError([api.name, 'route'], route);
        }
        const [method, url] = route.split(' ');
        api.method = method.toLowerCase();
        api.url = url;
    }
    parseReq(api, req) {
        if (req === undefined)
            return;
        if (apier_utils_1.kindOf(req) !== apier_utils_1.ApierKind.OBJECT) {
            throw new apier.ParserError([api.name, 'req'], 'must be object');
        }
        const { headers, params, query, body } = req;
        api.req = {};
        if (headers)
            this.parseParameters(api, ['req', 'headers'], headers);
        if (params)
            this.parseParameters(api, ['req', 'params'], params);
        if (query)
            this.parseParameters(api, ['req', 'query'], query);
        if (body)
            this.parseBody(api, ['req', 'body'], body);
    }
    parseRes(api, res) {
        api.res = { status: 200 };
        if (res === undefined) {
            return;
        }
        if (apier_utils_1.kindOf(res) !== apier_utils_1.ApierKind.OBJECT) {
            throw new apier.ParserError([api.name, 'res'], 'must be object');
        }
        const { status, body } = res;
        if (status)
            this.parseResStatus(api, status);
        if (body)
            this.parseBody(api, ['res', 'body'], body);
    }
    parseParameters(api, paths, obj) {
        if (typeof obj !== "object") {
            throw new apier.ParserError([api.name, ...paths], `must be object`);
        }
        for (const key in obj) {
            const value = obj[key];
            const valueKind = apier_utils_1.kindOf(value);
            if (valueKind === apier_utils_1.ApierKind.ARRAY || valueKind === apier_utils_1.ApierKind.OBJECT) {
                throw new apier.ParserError([api.name, ...paths, key], `must be scalar value`);
            }
        }
        lset(api, paths, obj);
    }
    parseResStatus(api, status = 200) {
        if (typeof status !== "number" && (status < 100 && status >= 600)) {
            throw new apier.ParserError([name, 'res', 'status'], `{status}`);
        }
        api.res.status = status;
    }
    parseBody(api, paths, body) {
        lset(api, paths, body);
    }
}
//# sourceMappingURL=index.js.map