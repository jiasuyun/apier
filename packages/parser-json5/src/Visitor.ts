import { valueOfLine, LineKind, LineValue, getLineComment, VisitArgs } from "./helper";
import { ApierComment } from "@jiasuyun/apier-comment";
import { CommentParserError } from "@jiasuyun/apier-parser-base";

const RE_META_COMMENT = /^\s*\/\/\s*@/;

export default class Visitor {
  private lines: string[];
  private comment: ApierComment;
  constructor(lines: string[], comment: ApierComment) {
    this.lines = lines;
    this.comment = comment;
  }
  visit(args: VisitArgs) {
    const { kind } = args;
    let nextArgs: VisitArgs;
    if (kind === "scopeArray") {
      nextArgs = this.scopeArray(args);
    } else if (kind === "scopeObject") {
      nextArgs = this.scopeObject(args);
    } else if (kind === "enterScope") {
      nextArgs = this.enterScope(args);
    } else if (kind === "exitScope") {
      nextArgs = this.exitScope(args);
    } else {
      return args;
    }
    return this.visit(nextArgs);
  }
  error(line: string, lineIndex: number) {
    return new CommentParserError(lineIndex + 1, line);
  }
  scopeArray(args: VisitArgs): VisitArgs {
    const { lineIndex, canCollectMetaComment, root, paths, numChild = 0 } = args;
    const commonArgs = { root, paths, numChild };
    let lineValue: LineValue;
    let line = this.lines[lineIndex];
    try {
      lineValue = valueOfLine(line);
    } catch (err) {
      throw this.error(line, lineIndex);
    }
    switch (lineValue.kind) {
      case LineKind.OBJECT:
        lineValue.key = String(commonArgs.numChild++);
        return { kind: "enterScope", lineIndex, canCollectMetaComment: false, lineValue, ...commonArgs };
      case LineKind.EXIT:
        return { kind: "exitScope", lineIndex: lineIndex + 1, canCollectMetaComment: false, ...commonArgs };
      default:
        if (canCollectMetaComment) {
          this.collectMetaComment(commonArgs.paths, line);
        }
        return { kind: "scopeArray", lineIndex: lineIndex + 1, canCollectMetaComment, ...commonArgs };
    }
  }
  scopeObject(args: VisitArgs): VisitArgs {
    const { lineIndex, canCollectMetaComment, root, paths, numChild } = args;
    const commonArgs = { root, paths, numChild };
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
        return { kind: "enterScope", lineIndex, canCollectMetaComment: false, lineValue, ...commonArgs };
      case LineKind.KV:
        const paths = [...commonArgs.paths, lineValue.key];
        this.collectComment(paths, line);
        return { kind: "scopeObject", lineIndex: lineIndex + 1, canCollectMetaComment: false, ...commonArgs };
      case LineKind.EXIT:
        return { kind: "exitScope", lineIndex: lineIndex + 1, canCollectMetaComment: false, ...commonArgs };
      default:
        if (canCollectMetaComment) {
          this.collectMetaComment(commonArgs.paths, line);
        }
        return { kind: "scopeObject", lineIndex: lineIndex + 1, canCollectMetaComment, ...commonArgs };
    }
  }
  enterScope(args: VisitArgs): VisitArgs {
    const { lineIndex, lineValue, root, paths, numChild } = args;
    const commonArgs = { root, paths, numChild };
    commonArgs.paths = [...commonArgs.paths, lineValue.key];
    this.collectComment(commonArgs.paths, this.lines[lineIndex]);
    commonArgs.root = args;
    return lineValue.kind === LineKind.ARRAY
      ? { kind: "scopeArray", lineIndex: lineIndex + 1, canCollectMetaComment: true, ...commonArgs }
      : { kind: "scopeObject", lineIndex: lineIndex + 1, canCollectMetaComment: true, ...commonArgs };
  }

  exitScope(args: VisitArgs): VisitArgs {
    const { lineIndex, root: parent } = args;
    if (!parent) {
      return { kind: "break", lineIndex, canCollectMetaComment: false, root: args.root, paths: args.paths };
    }
    const { root, paths, numChild } = parent;
    const commonArgs = { root, paths, numChild };
    const kind = root ? root.lineValue.kind : LineKind.OBJECT;
    return kind === LineKind.ARRAY
      ? { kind: "scopeArray", lineIndex, canCollectMetaComment: false, ...commonArgs }
      : { kind: "scopeObject", lineIndex, canCollectMetaComment: false, ...commonArgs };
  }

  collectMetaComment(paths, line) {
    const match = RE_META_COMMENT.exec(line);
    if (match) {
      this.comment.appendMeta(paths, line.slice(match[0].length));
    }
  }

  collectComment(paths, line) {
    const commentText = getLineComment(line);
    if (commentText) this.comment.append(paths, commentText);
  }
}
