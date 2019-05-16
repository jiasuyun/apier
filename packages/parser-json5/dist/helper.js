"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const JSON5 = __importStar(require("json5"));
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
// 正则： 判定进入数组
const RG_ENTER_ARRAY = /^\s*['"]?([a-zA-Z0-9_\-])+['"]?\s*:\s*\[\s*(\/\/.*)?$/g;
// 正则： 判定进入对象 
const RG_ENTER_OBJECT = /^\s*['"]?([a-zA-Z0-9_\-])+['"]?\s*:\s*\{\s*(\/\/.*)?$/g;
;
// 正则： 判定KV 
const RE_KV = /^\s*['"]?([a-zA-Z0-9_\-])+['"]?\s*:\s*\S+/g;
/**
 * 获取行值
 */
function valueOfLine(line) {
    if (RG_ENTER_ARRAY.test(line)) {
        return { key: keyOfLine(line, RG_ENTER_ARRAY), kind: LineKind.ARRAY };
    }
    if (RG_ENTER_OBJECT.test(line)) {
        return { key: keyOfLine(line, RG_ENTER_OBJECT), kind: LineKind.OBJECT };
    }
    const error = () => new Error(`can not get value of line: ${line}`);
    if (RE_KV.test(line)) {
        try {
            JSON5.parse(`{${line.replace(/\/\/.*$/g, '')}}`); // 检查行合法
        }
        catch (err) {
            throw error();
        }
        return { key: keyOfLine(line, RE_KV), kind: LineKind.KV };
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
function keyOfLine(line, rg) {
    const matched = line.match(rg);
    if (!matched)
        return '';
    return matched[1];
}
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
//# sourceMappingURL=helper.js.map