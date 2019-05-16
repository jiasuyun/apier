export interface CommentObject {
    [k: string]: any;
}
export interface CommentItem {
    paths: string[];
    comment: CommentObject;
}
export declare class ApierComment {
    private comments;
    constructor(comments?: any[]);
    /**
     * 获取行注释
     *
     * `...// optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
     */
    static commentOfLine(line: any): {
        [k: string]: any;
    };
    append(paths: string[], line: string): void;
    scope(paths: any): ApierComment;
    retrive(paths: any): CommentObject;
}
