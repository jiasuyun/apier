import { valueOfLine, LineKind, LineValue, getLineComment } from "./helper";
import { ApierComment } from "@jiasuyun/apier-comment";
import { CommentParserError } from "@jiasuyun/apier-parser-base";

export default class Visitor {
  private lines: string[];
  private comment: ApierComment;
  private paths: string[];
  private numChild: number;
  private lineValue?: LineValue;
  private parent?: Visitor;
  constructor(lines: string[], comment: ApierComment, paths: string[]) {
    this.lines = lines;
    this.comment = comment;
    this.paths = paths;
    this.numChild = 0;
    this.lineValue = { kind: LineKind.OBJECT };
  }
  error(line: string, lineIndex: number) {
    return new CommentParserError(lineIndex, line);
  }
  scopeArray(lineIndex: number) {
    let lineValue: LineValue;
    let line = this.lines[lineIndex];
    try {
      lineValue = valueOfLine(line);
    } catch (err) {
      throw this.error(line, lineIndex);
    }
    switch (lineValue.kind) {
      case LineKind.OBJECT:
        lineValue.key = String(this.numChild++);
        return this.enterScope(lineValue, lineIndex);
      case LineKind.EXIT:
        return this.exitScope(lineIndex + 1);
      default:
        return this.scopeArray(lineIndex + 1);
    }
  }
  scopeObject(lineIndex: number) {
    let lineValue: LineValue;
    let line = this.lines[lineIndex];
    try {
      lineValue = valueOfLine(line);
    } catch (err) {
      throw this.error(line, lineIndex);
    }
    switch (lineValue.kind) {
      case LineKind.ARRAY:
      case LineKind.OBJECT:
        return this.enterScope(lineValue, lineIndex);
      case LineKind.KV:
        const paths = [...this.paths, lineValue.key];
        this.collectComment(paths, line);
        return this.scopeObject(lineIndex + 1);
      case LineKind.EXIT:
        return this.exitScope(lineIndex + 1);
      default:
        return this.scopeObject(lineIndex + 1);
    }
  }
  enterScope(lineValue: LineValue, lineIndex: number) {
    const { lines, comment } = this;
    const paths = [...this.paths, lineValue.key];
    this.collectComment(paths, this.lines[lineIndex]);
    const visitor = new Visitor(lines, comment, paths);
    visitor.lineValue = lineValue;
    visitor.parent = this;
    return visitor.lineValue.kind === LineKind.ARRAY
      ? visitor.scopeArray(lineIndex + 1)
      : visitor.scopeObject(lineIndex + 1);
  }

  exitScope(lineIndex) {
    const visitor = this.parent;
    if (!this.parent) return;
    return visitor.lineValue.kind === LineKind.ARRAY
      ? visitor.scopeArray(lineIndex)
      : visitor.scopeObject(lineIndex);
  }

  collectComment(paths, line) {
    const commentText = getLineComment(line);
    if (commentText) this.comment.append(paths, commentText);
  }
}
