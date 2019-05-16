"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
class Visitor {
    constructor(lines, comment, paths) {
        this.lines = lines;
        this.comment = comment;
        this.paths = paths;
        this.numChild = 0;
        this.lineValue = { kind: helper_1.LineKind.OBJECT };
    }
    error(line, lineIndex) {
        return new Error(`Line ${lineIndex}: ${line}`);
    }
    scopeArray(lineIndex) {
        let lineValue;
        let line = this.lines[lineIndex];
        try {
            lineValue = helper_1.valueOfLine(line);
        }
        catch (err) {
            throw this.error(line, lineIndex);
        }
        switch (lineValue.kind) {
            case helper_1.LineKind.OBJECT:
                lineValue.key = String(this.numChild++);
                return this.enterScope(lineValue, lineIndex);
            case helper_1.LineKind.EXIT:
                return this.exitScope(lineIndex + 1);
            default:
                return this.scopeArray(lineIndex + 1);
        }
    }
    scopeObject(lineIndex) {
        let lineValue;
        let line = this.lines[lineIndex];
        try {
            lineValue = helper_1.valueOfLine(line);
        }
        catch (err) {
            throw this.error(line, lineIndex);
        }
        switch (lineValue.kind) {
            case helper_1.LineKind.ARRAY:
            case helper_1.LineKind.OBJECT:
                return this.enterScope(lineValue, lineIndex);
            case helper_1.LineKind.KV:
                const paths = [...this.paths, lineValue.key];
                this.comment.append(paths, line);
                return this.scopeObject(lineIndex + 1);
            case helper_1.LineKind.EXIT:
                return this.exitScope(lineIndex + 1);
            default:
                return this.scopeObject(lineIndex + 1);
        }
    }
    enterScope(lineValue, lineIndex) {
        const { lines, comment } = this;
        const paths = [...this.paths, lineValue.key];
        this.comment.append(paths, this.lines[lineIndex]);
        const visitor = new Visitor(lines, comment, paths);
        visitor.lineValue = lineValue;
        visitor.parent = this;
        return visitor.lineValue.kind === helper_1.LineKind.ARRAY ? visitor.scopeArray(lineIndex + 1) : visitor.scopeObject(lineIndex + 1);
    }
    exitScope(lineIndex) {
        const visitor = this.parent;
        if (!this.parent)
            return;
        return visitor.lineValue.kind === helper_1.LineKind.ARRAY ? visitor.scopeArray(lineIndex) : visitor.scopeObject(lineIndex);
    }
}
exports.default = Visitor;
//# sourceMappingURL=Visitor.js.map