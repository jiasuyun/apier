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
const JSON5 = __importStar(require("json5"));
const extract_comments_1 = __importDefault(require("extract-comments"));
var LineKind;
(function (LineKind) {
    // 行类型： 进入数组, `foo: [`
    LineKind["ARRAY"] = "array";
    // 行类型： 进入对象, `foo: {`
    LineKind["OBJECT"] = "object";
    // 行类型： Key-Value, `foo: bar`, `foo: [1, 2]`, `foo: { a: 3, b: 4 }`
    LineKind["KV"] = "kv";
    // 行类型：退出域, `}`, `]`
    LineKind["EXIT"] = "exit";
    // 行类型:  空, ` `, `// ...` 或其他无法识别行
    LineKind["EMPTY"] = "empty";
})(LineKind = exports.LineKind || (exports.LineKind = {}));
// 正则： 判定 `key:` `"key":` `'key':` `'key' :`
const RE_KEY = /^("[^"]+"|'[^']+'|[^\s:]+)\s*:/;
// 正则: 判定进入数组
const RE_ENTER_ARRAY = /\[\s*(\/\/.*)?$/;
// 正则: 判定进入对象
const RE_ENTER_OBJECT = /{\s*(\/\/.*)?$/;
/**
 * 获取行值
 */
function valueOfLine(line) {
    line = line.trim();
    const error = () => new Error(`bad line: ${line}`);
    let matched = RE_KEY.exec(line);
    if (matched) {
        const key = matched[1].replace(/(^"|^'|"$|'$)/g, '');
        const tail = line.slice(matched[0].length).trim();
        if (RE_ENTER_ARRAY.test(tail)) {
            return { key, kind: LineKind.ARRAY };
        }
        if (RE_ENTER_OBJECT.test(tail)) {
            return { key, kind: LineKind.OBJECT };
        }
        try {
            JSON5.parse(`{${line.replace(/\/\/.*$/g, '')}}`); // 检查行合法
        }
        catch (err) {
            throw error();
        }
        return { key, kind: LineKind.KV };
    }
    const text = line // 移除空白和注释
        .replace(/\/\/.*$/g, '')
        .replace(/,\s*$/g, '')
        .replace(/(^\s*)|(\s*$)/g, "");
    if (text === '{') {
        return { kind: LineKind.OBJECT };
    }
    if (text === '}' || text === ']') {
        return { kind: LineKind.EXIT };
    }
    if (text === '') {
        return { kind: LineKind.EMPTY };
    }
    try {
        JSON5.parse(text); // 有效的数组元素
        return { kind: LineKind.EMPTY };
    }
    catch (err) {
        throw error();
    }
}
exports.valueOfLine = valueOfLine;
// 判断根 `{`
const RE_ROOT_CURLY_BRACE = /^\s*{/;
/**
 * 起始行号
 */
function beignLineNum(lines) {
    for (let i = 0; i < lines.length; i++) {
        if (RE_ROOT_CURLY_BRACE.test(lines[i]))
            return i;
    }
    return -1;
}
exports.beignLineNum = beignLineNum;
/**
 * 提取注释部分
 */
function getLineComment(line) {
    const lineValue = valueOfLine(line);
    let patchLine = line;
    switch (lineValue.kind) {
        case LineKind.ARRAY:
            patchLine = line + '\n]';
            break;
        case LineKind.OBJECT:
            patchLine = line + '\n}';
            break;
        case LineKind.KV:
            patchLine = `{\n` + line + '\n}';
            break;
        case LineKind.EXIT:
        case LineKind.EMPTY:
            return '';
    }
    try {
        return extract_comments_1.default(patchLine)
            .filter(c => c.type === 'LineComment')
            .map(c => c.value)[0];
    }
    catch (err) { }
    return '';
}
exports.getLineComment = getLineComment;
//# sourceMappingURL=helper.js.map