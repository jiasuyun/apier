import { valueOfLine, LineKind, LineValue, getLineComment } from "./helper";
import { ApierComment } from "@jiasuyun/apier-comment";
import { CommentParserError } from "@jiasuyun/apier-parser-base";

const RE_META_COMMENT = /^\s*\/\/\s*@/;

export interface VisitArgs {
  lines: string[];
  comment: ApierComment;
  kind: "scopeArray" | "scopeObject" | "enterScope" | "exitScope" | "break";
  lineIndex: number;
  canCollectMetaComment: boolean;
  paths: string[];
  root?: VisitArgs;
  numChild?: number;
}

export function visit(args: VisitArgs) {
  while (args.kind !== "break") {
    if (args.kind === "scopeArray") {
      args = scopeArray(args);
    } else if (args.kind === "scopeObject") {
      args = scopeObject(args);
    } else if (args.kind === "enterScope") {
      args = enterScope(args);
    } else if (args.kind === "exitScope") {
      args = exitScope(args);
    }
  }
}

function scopeArray(args: VisitArgs): VisitArgs {
  const { lineIndex } = args;
  const lineValue = getLineValue(args);
  switch (lineValue.kind) {
    case LineKind.OBJECT:
      return getNextArgs(args, {
        kind: "enterScope",
        canCollectMetaComment: false
      });
    case LineKind.EXIT:
      return getNextArgs(args, {
        kind: "exitScope",
        lineIndex: lineIndex + 1,
        canCollectMetaComment: false
      });
    default:
      if (args.canCollectMetaComment) {
        collectMetaComment(args);
      }
      return getNextArgs(args, {
        kind: "scopeArray",
        lineIndex: lineIndex + 1
      });
  }
}

function scopeObject(args: VisitArgs): VisitArgs {
  const { lineIndex } = args;
  const lineValue = getLineValue(args);
  switch (lineValue.kind) {
    case LineKind.ARRAY:
    case LineKind.OBJECT:
      return getNextArgs(args, {
        kind: "enterScope",
        canCollectMetaComment: false
      });
    case LineKind.KV:
      const paths = [...args.paths, lineValue.key];
      collectComment(args, paths);
      return getNextArgs(args, {
        kind: "scopeObject",
        lineIndex: lineIndex + 1,
        canCollectMetaComment: false
      });
    case LineKind.EXIT:
      return getNextArgs(args, {
        kind: "exitScope",
        lineIndex: lineIndex + 1,
        canCollectMetaComment: false
      });
    default:
      if (args.canCollectMetaComment) {
        collectMetaComment(args);
      }
      return getNextArgs(args, {
        kind: "scopeObject",
        lineIndex: lineIndex + 1
      });
  }
}

function enterScope(args: VisitArgs): VisitArgs {
  const { lineIndex } = args;
  const lineValue = getLineValue(args);
  const paths = [...args.paths, lineValue.key];
  collectComment(args, paths);
  if (lineValue.kind === LineKind.ARRAY) {
    return getNextArgs(args, {
      kind: "scopeArray",
      numChild: 0,
      lineIndex: lineIndex + 1,
      canCollectMetaComment: true,
      paths,
      root: args
    });
  } else {
    return getNextArgs(args, {
      kind: "scopeObject",
      lineIndex: lineIndex + 1,
      canCollectMetaComment: true,
      paths,
      root: args
    });
  }
}

function exitScope(args: VisitArgs): VisitArgs {
  if (!args.root) {
    return getNextArgs(args, { kind: "break" });
  }
  const parnetArgs = args.root;
  const kind = parnetArgs.root ? getLineValue(parnetArgs.root).kind : LineKind.OBJECT;
  if (kind === LineKind.ARRAY) {
    parnetArgs.numChild++;
    return getNextArgs(parnetArgs, {
      kind: "scopeArray",
      lineIndex: args.lineIndex,
      canCollectMetaComment: true,
      root: parnetArgs.root
    });
  } else {
    return getNextArgs(parnetArgs, {
      kind: "scopeObject",
      numChild: 0,
      lineIndex: args.lineIndex,
      canCollectMetaComment: true,
      root: parnetArgs.root
    });
  }
}

function collectMetaComment(args: VisitArgs) {
  const { comment, paths, lines, lineIndex } = args;
  const line = lines[lineIndex];
  const match = RE_META_COMMENT.exec(line);
  if (match) {
    comment.appendMeta(paths, line.slice(match[0].length));
  }
}

function collectComment(args: VisitArgs, paths: string[]) {
  const { comment, lines, lineIndex } = args;
  const line = lines[lineIndex];
  const commentText = getLineComment(line);
  if (commentText) comment.append(paths, commentText);
}

function getNextArgs(args: VisitArgs, changes: Partial<VisitArgs>): VisitArgs {
  return Object.assign({ numChild: 0 }, args, changes);
}

function getLineValue(args: VisitArgs): LineValue {
  const { lines, lineIndex } = args;
  let line = lines[lineIndex];
  let lineValue: LineValue;
  try {
    lineValue = valueOfLine(line);
  } catch (err) {
    throw new CommentParserError(lineIndex + 1, line);
  }
  if (!lineValue.key) lineValue.key = String(args.numChild || 0);
  return lineValue;
}
