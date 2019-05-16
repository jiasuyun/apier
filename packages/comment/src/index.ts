import * as  extract from 'babel-extract-comments';

// 注释键值, `optional`, `type=integer`, `description="split with ws"`
const RG_COMMENT_VALUE = /([A-Za-z_\-]+)(\=("[^"]*"|'[^']*'|[^"'\s]+))?/;

export interface CommentObject {
  [k: string]: any;
}
export interface CommentItem {
  paths: string[];
  comment: CommentObject;
}

export class ApierComment {
  private comments: CommentItem[];
  constructor(comments = []) {
    this.comments = comments;
  }
  /**
   * 获取行注释
   * 
   * `...// optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
   */
  public static commentOfLine(line): { [k: string]: any } {
    let result = {}
    const commentText = extract(line)
      .filter(c => c.type === 'CommentLine')
      .map(c => line.slice(c.start + 2, c.end).trim())[0];
    if (!commentText) return result;
    let matched;
    while (matched = RG_COMMENT_VALUE.exec(commentText)) {
      const key = matched[1];
      let value = matched[3];
      if (value === undefined) {
        value = true;
      } else {
        try {
          value = JSON.parse(value);
        } catch (err) { }
      }
      result[key] = value;
    }
    return result;
  }
  public append(paths: string[], line: string) {
    const comment = ApierComment.commentOfLine(line);
    if (comment) this.comments.push({ paths, comment });
  }
  public scope(paths) {
    const comments = this
      .comments
      .filter(c => isPrefixArray(paths, c.paths))
      .map(c => ({ paths: c.paths.slice(paths.length), comment: c.comment }))
    return new ApierComment(comments);
  }
  public retrive(paths): CommentObject {
    const commentItem = this.comments.find(c => isPrefixArray(paths, c.paths))
    if (!commentItem) return {};
    return commentItem.comment;
  }
}

function isPrefixArray<T>(prefixArr: T[], arr: T[]) {
  return prefixArr.every((v, i) => arr[i] === v);
}