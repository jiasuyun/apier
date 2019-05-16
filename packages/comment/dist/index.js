"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const omit_1 = __importDefault(require("lodash/omit"));
const pick_1 = __importDefault(require("lodash/pick"));
// 注释键值, `optional`, `type=integer`, `description="split with ws"`
const RG_COMMENT_VALUE = /([A-Za-z_\-]+)(\=("[^"]*"|'[^']*'|[^\s]+))?/g;
class ApierComment {
    constructor(comments = []) {
        this.comments = comments;
    }
    append(paths, commentText) {
        const comment = this.parse(commentText);
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
    retrive(paths = []) {
        const commentItem = this.comments.find(c => isPrefixArray(paths, c.paths));
        return new CommentUtil(commentItem ? commentItem.comment : {});
    }
    /**
     * 获取行注释
     *
     * `optional type=integer format=int32` => { optional: true, type: integer, format: int32 }
     */
    parse(commentText) {
        const result = {};
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
}
exports.ApierComment = ApierComment;
class CommentUtil {
    constructor(comment) {
        this.comment = comment;
    }
    omit(keys) {
        return omit_1.default(this.comment, keys);
    }
    pick(keys) {
        return pick_1.default(this.comment, keys);
    }
    val(key, defaultValue) {
        if (key === undefined)
            return Object.assign({}, this.comment);
        if (this.comment.hasOwnProperty(key)) {
            return this.comment[key];
        }
        return defaultValue;
    }
}
exports.CommentUtil = CommentUtil;
function isPrefixArray(prefixArr, arr) {
    return prefixArr.every((v, i) => arr[i] === v);
}
//# sourceMappingURL=index.js.map