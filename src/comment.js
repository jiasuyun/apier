function parse(lines) {
  const comments = [];
  const root = new Visitor(lines, comments, []);
  root.kind = { type: 'object', key: '$' };
  root.scopeObject(1);
  return comments;
}

function connect(json5, comments) {

}

class Visitor {
  constructor(lines, comments, paths) {
    this.lines = lines;
    this.comments = comments;
    this.paths = paths;
    this.numChild = 0;
  }
  scopeArray(lineIndex) {
    const kind = getLineKind(currentLine);
    switch (kind.type) {
      case 'object':
        kind.key = this.numChild++;
        return this.enterScope(kind, lineIndex);
      case 'exit':
        return this.exitScope(lineIndex++);
      default:
        return this.scopeArray(lineIndex++);
    }
  }
  scopeObject(lineIndex) {
    const kind = getLineKind(this.lines[lineIndex]);
    switch (kind.type) {
      case 'array':
      case 'object':
        return this.enterScope(kind, lineIndex);
      case 'kv':
        const paths = [...this.paths, kind.name];
        this.resolveComment(paths, this.lines[lineIndex]);
        return this.scopeObject(lineIndex++);
      case 'exit':
        return this.exitScope(lineIndex++);
      default:
        return this.scopeObject(lineIndex++);
    }
  }
  enterScope(kind, lineIndex) {
    if (lineIndex >= lines.length) return;
    const { lines, comments } = this;
    const paths = [...this.paths, kind.name];
    this.resolveComment(paths, this.lines[lineIndex]);
    const visitor = new Visitor(lines, comments, paths);
    visitor.kind = kind;
    visitor.parent = this;
    return visitor.kind.type === 'array' ? visitor.scopeArray(lineIndex++) : visitor.scopeObject(lineIndex++);
  }

  resolveComment(paths, line) {
    const comment = getLineComment(line);
    if (comment) this.comments.push({ paths, comment });
  }

  exitScope(lineIndex) {
    return this.parent.enterScope(this.parent.kind, lineIndex + 1);
  }
}

/**
 * 获取keyName
 * @param line 
 * @param reg 
 */
const getKeyName = (line, reg) => {
  return line.match(reg).map(function (v) {
    if (!v) return '';
    let result = v.split(":")[0].replace(/(^\s*)|(\s*$)/g, "");
    if (/"[^"]*"|'[^"]*'/.test(result)) result = result.substring(1, result.length - 1);
    return result;
  })[0] || '';
}

/**
 * 获取行类型
 * 
 * @example
 * `foo: [` // { type: array, key: foo }
 * `foo: {` //  { type: object, key: foo }
 * `foo: bar,` //  { type: kv, key: foo }
 * `{` // { type: object }
 * `//` //  { type: empty }
 * ` ` // { type: empty }
 * `}` // { type: exit }
 * `]` // { type: exit }
 */

function getLineKind(line) {
  const result = {};
  const reg1 = /['"]?([a-zA-Z0-9])+['"]?(\s)*:(\s)*\[/g;
  const reg2 = /['"]?([a-zA-Z0-9])+['"]?(\s)*:(\s)*\{/g;
  const reg3 = /['"]?([a-zA-Z0-9])+['"]?(\s)*:(\s)*['"]?([a-zA-Z0-9])+['"]?/g;
  if (reg1.test(line)) {
    result['type'] = 'array';
    result['key'] = getKeyName(line, reg1);
  } else if (reg2.test(line)) {
    result['type'] = 'object';
    result['key'] = getKeyName(line, reg2);
  } else if (reg3.test(line)) {
    result['type'] = 'kv';
    result['key'] = getKeyName(line, reg3);
  } else {
    const text = line.replace(/(^\s*)|(\s*$)/g, "")
    switch (text) {
      case '{':
        result['type'] = 'object';
        break;
      case '//':
        result['type'] = 'empty';
        break;
      case '':
        result['type'] = 'empty';
        break;
      case '}':
        result['type'] = 'exit';
        break;
      case ']':
        result['type'] = 'exit';
        break;
      default:
        console.error(`该行格式错误:\n${line}`);
    }
  }
  return result;
}

/**
 * 获取行注释
 * 
 * `...// optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
 */
function getLineComment(line) {
  let isComment = false;
  const result = {};
  const reg1 = /(\S+=("[^"]*"|'[^']*'))|"[^"]*"|'[^"]*'|\S+/g;
  const reg2 = /'[^']*\/\/[^']*'|"[^"]*\/\/[^"]*"/;
  if (!line.includes("//")) return result;
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
        result[key] = value;
      } else {
        result[item] = true;
      }
    }
  }
  return result;
}


module.exports = {
  parse, connect,
  // export for test
  _getLineKind: getLineKind,
  _getLineComment: getLineComment,
};