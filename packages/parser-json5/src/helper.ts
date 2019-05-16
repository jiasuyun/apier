import * as JSON5 from 'json5';
import extract from 'extract-comments';

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

// 正则： 判定 `key:` `"key":` `'key':` `'key' :`
const RE_KEY = /^("[^"]+"|'[^']+'|[^\s:]+)\s*:/;
// 正则: 判定进入数组
const RE_ENTER_ARRAY = /\[\s*(\/\/.*)?$/;
// 正则: 判定进入对象
const RE_ENTER_OBJECT = /{\s*(\/\/.*)?$/;
/**
 * 获取行值
 */
export function valueOfLine(line: string): LineValue {
  line = line.trim()
  const error = () => new Error(`bad line: ${line}`);
  let matched = RE_KEY.exec(line);
  if (matched) {
    const key = matched[1].replace(/(^"|^'|"$|'$)/g, '');
    const tail = line.slice(matched[0].length).trim();
    if (RE_ENTER_ARRAY.test(tail)) {
      return { key, kind: LineKind.ARRAY };
    }
    if(RE_ENTER_OBJECT.test(tail)) {
      return { key, kind: LineKind.OBJECT };
    }
    try {
      JSON5.parse(`{${line.replace(/\/\/.*$/g, '')}}`) // 检查行合法
    } catch (err) {
      throw error();
    }
    return { key, kind: LineKind.KV };
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

// 判断根 `{`
const RE_ROOT_CURLY_BRACE = /^\s*{/
/**
 * 起始行号
 */
export function beignLineNum(lines: string[]) {
  for (let i = 0; i < lines.length; i++) {
    if (RE_ROOT_CURLY_BRACE.test(lines[i])) return i;
  }
  return -1;
}

/**
 * 提取注释部分
 */
export function getLineComment(line: string): string {
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
    return extract(patchLine)
      .filter(c => c.type === 'LineComment')
      .map(c => c.value)[0];
  } catch (err) { }
  return '';
}