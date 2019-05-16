export interface CommentObject {
    [k: string]: any;
}
export interface CommentItem {
    paths: string[];
    comment: CommentObject;
}
export declare class ApierComment {
    readonly comments: CommentItem[];
    constructor(comments?: any[]);
    append(paths: string[], commentText: string): void;
    scope(paths: string[]): ApierComment;
    retrive(paths?: string[]): CommentUtil;
    /**
     * 获取行注释
     *
     * `optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
     */
    private parse;
}
export declare class CommentUtil {
    private readonly comment;
    constructor(comment: CommentObject);
    omit(keys: string[]): any;
    pick(keys: string[]): any;
    val(key?: string, defaultValue?: any): any;
}
