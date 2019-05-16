"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function kindOf(value) {
    if (value === null) {
        return ApierKind.NULL;
    }
    switch (typeof value) {
        case 'boolean':
            return ApierKind.BOOLEAN;
        case 'number':
            if (Number.isInteger(value)) {
                return ApierKind.INTEGER;
            }
            return ApierKind.NUMBER;
        case 'string':
            return ApierKind.STRING;
        default:
            if (Array.isArray(value)) {
                return ApierKind.ARRAY;
            }
            return ApierKind.OBJECT;
    }
}
exports.kindOf = kindOf;
var ApierKind;
(function (ApierKind) {
    ApierKind["NUMBER"] = "number";
    ApierKind["INTEGER"] = "integer";
    ApierKind["STRING"] = "string";
    ApierKind["BOOLEAN"] = "boolean";
    ApierKind["ARRAY"] = "array";
    ApierKind["OBJECT"] = "object";
    ApierKind["NULL"] = "null";
})(ApierKind = exports.ApierKind || (exports.ApierKind = {}));
//# sourceMappingURL=index.js.map