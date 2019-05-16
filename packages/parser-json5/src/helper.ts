import * as JSON5 from 'json5';

export enum LineKind {
  // 行类型： 进入数组, `foo: [`
  ARRAY = 'array',
  // 行类型： 进入对象, `foo: {`
  OBJECT = 'object',
  // 行类型： Key-Value, `foo: bar`, `foo: [1, 2]`, `foo: { a: 3, b: 4 }`
  KV = 'kv',
  // 行类型：退出域, `}`, `]`
  EXIT = 'exit',
  // 行类型:  空, ` `, `// ...` 或其他无法识别行
  EMPTY = 'empty',
}

export interface LineValue {
  kind: LineKind;
  key?: string;
}


// 正则： 判定进入数组
const RG_ENTER_ARRAY = /^\s*['"]?([a-zA-Z0-9_\-])+['"]?\s*:\s*\[\s*(\/\/.*)?$/g;
// 正则： 判定进入对象 
const RG_ENTER_OBJECT = /^\s*['"]?([a-zA-Z0-9_\-])+['"]?\s*:\s*\{\s*(\/\/.*)?$/g;;
// 正则： 判定KV 
const RE_KV = /^\s*['"]?([a-zA-Z0-9_\-])+['"]?\s*:\s*\S+/g;
/**
 * 获取行值
 */
export function valueOfLine(line: string, index: number): LineValue {
  if (RG_ENTER_ARRAY.test(line)) {
    return { key: keyOfLine(line, RG_ENTER_ARRAY), kind: LineKind.ARRAY };
  }
  if (RG_ENTER_OBJECT.test(line)) {
    return { key: keyOfLine(line, RG_ENTER_OBJECT), kind: LineKind.OBJECT };
  }
  const error = () => new Error(`Line ${index}: ${line}`);
  if (RE_KV.test(line)) {
    try {
      JSON5.parse(`{${line.replace(/\/\/.*$/g, '')}}`) // 检查行合法
    } catch (err) {
      throw error();
    }
    return { key: keyOfLine(line, RE_KV), kind: LineKind.KV };
  }
  const text = line // 移除空白和注释
    .replace(/\/\/.*$/g, '')
    .replace(/,\s*$/g, '')
    .replace(/(^\s*)|(\s*$)/g, "");
  if (text === '{') {
    return { kind: LineKind.OBJECT }
  }
  if (text === '}' || text === ']') {
    return { kind: LineKind.EXIT }
  }
  if (text === '') {
    return { kind: LineKind.EMPTY }
  }
  try {
    JSON5.parse(text); // 有效的数组元素
    return { kind: LineKind.EMPTY }
  } catch (err) {
    throw error();
  }
}

function keyOfLine(line: string, rg: RegExp): string {
  const matched = line.match(rg);
  if (!matched) return '';
  return matched[1];
}

/**
 * 获取行注释
 * 
 * `...// optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
 */
export function commentsOfLine(line) {
  let isComment = false;
  let result;
  const reg1 = /(\S+=("[^"]*"|'[^']*'))|"[^"]*"|'[^"]*'|\S+/g;
  const reg2 = /'[^']*\/\/[^']*'|"[^"]*\/\/[^"]*"/;
  if (!line.includes("//")) return result;
  const addToResult = (k, v) => {
    if (!result) result = {};
    try {
      v = JSON.parse(v);
    } catch (err) { }
    result[k] = v;
  }
  const textArr = line.match(reg1);
  for (let item of textArr) {
    if (!isComment && item.includes("//") && !reg2.test(item)) isComment = true;
    if (isComment) {
      const subscript = item.indexOf('//');
      if (subscript > -1) item = item.substring(subscript + 2).replace(/(^\s*)|(\s*$)/g, "");
      if (!item) continue;
      const subscript2 = item.indexOf('=');
      if (subscript2 > 0) {
        let key = item.substring(0, subscript2);
        let value = item.substring(subscript2 + 1);
        if (/"[^"]*"|'[^"]*'/.test(value)) value = value.substring(1, value.length - 1);
        addToResult(key, value);
      } else {
        addToResult(item, true);
      }
    }
  }
  return result;
}
