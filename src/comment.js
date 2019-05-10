function parse(lines) {
  const comments = [];
  const root = new Visitor(lines, comments, [], 1);
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
    return parent.enterScope(parent.kind, lineIndex + 1);
  }
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
  
}

/**
 * 获取行注释
 * 
 * `...// optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
 */
function getLineComment(line) {

}


module.exports = {
  parse, connect,
  // export for test
  _getLineKind: getLineKind,
  _getLineComment: getLineComment,
};