"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const extract = __importStar(require("babel-extract-comments"));
// 注释键值, `optional`, `type=integer`, `description="split with ws"`
const RG_COMMENT_VALUE = /([A-Za-z_\-]+)(\=("[^"]*"|'[^']*'|[^"'\s]+))?/;
class ApierComment {
    constructor(comments = []) {
        this.comments = comments;
    }
    /**
     * 获取行注释
     *
     * `...// optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
     */
    static commentOfLine(line) {
        let result = {};
        const commentText = extract(line)
            .filter(c => c.type === 'CommentLine')
            .map(c => line.slice(c.start + 2, c.end).trim())[0];
        if (!commentText)
            return result;
        let matched;
        while (matched = RG_COMMENT_VALUE.exec(commentText)) {
            const key = matched[1];
            let value = matched[3];
            if (value === undefined) {
                value = true;
            }
            else {
                try {
                    value = JSON.parse(value);
                }
                catch (err) { }
            }
            result[key] = value;
        }
        return result;
    }
    append(paths, line) {
        const comment = ApierComment.commentOfLine(line);
        if (comment)
            this.comments.push({ paths, comment });
    }
    scope(paths) {
        const comments = this
            .comments
            .filter(c => isPrefixArray(paths, c.paths))
            .map(c => ({ paths: c.paths.slice(paths.length), comment: c.comment }));
        return new ApierComment(comments);
    }
    retrive(paths) {
        const commentItem = this.comments.find(c => isPrefixArray(paths, c.paths));
        if (!commentItem)
            return {};
        return commentItem.comment;
    }
}
exports.ApierComment = ApierComment;
function isPrefixArray(prefixArr, arr) {
    return prefixArr.every((v, i) => arr[i] === v);
}
//# sourceMappingURL=index.js.map