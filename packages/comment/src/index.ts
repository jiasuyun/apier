import omit from "lodash/omit";
import pick from "lodash/pick";
import merge from "lodash/merge";
import lodashSet from "lodash/set";
import lodashGet from "lodash/get";

// 注释键值, `optional`, `type=integer`, `description="split with ws"`, `a.b[0].c=3`
const RG_COMMENT_VALUE = /([^\s=]+)(\=("[^"]*"|'[^']*'|[^\s]+))?/g;

export interface CommentObject {
  [k: string]: any;
}
export interface CommentItem {
  paths: string[];
  comment: CommentObject;
  meta?: CommentObject;
}

export class ApierComment {
  public readonly comments: CommentItem[];
  constructor(comments = []) {
    this.comments = comments;
  }
  /**
   * 获取行注释
   *
   * `optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
   */
  public static parse(commentText: string): { [k: string]: any } {
    const result = {};
    let matched;
    while ((matched = RG_COMMENT_VALUE.exec(commentText))) {
      const key = matched[1];
      let value = matched[3];
      if (value === undefined) {
        value = true;
      } else {
        try {
          value = JSON.parse(value);
        } catch (err) {}
      }
      value = removePairQuote(value);
      lodashSet(result, key, value);
    }
    return result;
  }
  public append(paths: string[], commentText: string) {
    let comment = ApierComment.parse(commentText);
    if (!comment) {
      return;
    }
    const existCommentObj = this.find(paths);
    if (!existCommentObj) {
      this.comments.push({ paths, comment });
      return;
    }
    merge(existCommentObj.comment, comment);
  }
  public appendMeta(paths: string[], commentText: string) {
    let meta = ApierComment.parse(commentText);
    if (!meta) {
      return;
    }
    const existCommentObj = this.find(paths);
    if (!existCommentObj) {
      this.comments.push({ paths, comment: {}, meta });
      return;
    }
    if (!existCommentObj.meta) {
      existCommentObj.meta = meta;
      return;
    }
    merge(existCommentObj.meta, meta);
  }
  public scope(paths: string[]) {
    const comments = this.comments
      .filter(c => isPrefixArray(paths, c.paths))
      .map(c => {
        const n: CommentItem = { paths: c.paths.slice(paths.length), comment: c.comment };
        if (c.meta) {
          n.meta = c.meta;
        }
        return n;
      });
    return new ApierComment(comments);
  }
  public retrive(paths: string[] = []): CommentUtil {
    const commentItem = this.find(paths);
    return new CommentUtil(commentItem ? commentItem.comment : {});
  }
  public retriveMeta(paths: string[] = []): any {
    const commentItem = this.find(paths);
    return commentItem && commentItem.meta;
  }
  public changePaths(srcPaths: string[], targetPaths: string[]) {
    return this.comments
      .filter(c => isPrefixArray(srcPaths, c.paths))
      .forEach(c => {
        c.paths.splice(0, srcPaths.length, ...targetPaths);
      });
  }
  private find(paths: string[]): CommentItem {
    return this.comments.find(c => paths.length === c.paths.length && isPrefixArray(paths, c.paths));
  }
}

export class CommentUtil {
  private readonly comment: CommentObject;
  constructor(comment: CommentObject) {
    this.comment = comment;
  }
  omit(keys: string[]) {
    return omit(this.comment, keys);
  }
  pick(keys: string[]) {
    return pick(this.comment, keys);
  }
  val(key?: string, defaultValue?: any) {
    if (key === undefined) return { ...this.comment };
    return lodashGet(this.comment, key, defaultValue);
  }
}

function isPrefixArray<T>(prefixArr: T[], arr: T[]) {
  return prefixArr.every((v, i) => arr[i] === v);
}

function removePairQuote(value: any): any {
  const quotes = ['"', "'", "`"];
  if (typeof value === "string") {
    if (quotes.indexOf(value[0]) > -1 && value[0] === value[value.length - 1]) {
      return value.slice(1, -1);
    }
  }
  return value;
}
