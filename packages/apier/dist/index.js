"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apier_utils_1 = require("@dee-contrib/apier-utils");
class ApierItem {
    constructor(comment, name, value) {
        this.comment = comment.scope(['name']);
        this.name = name;
        this.value = value;
    }
    kind() {
        return apier_utils_1.kindOf(this.value);
    }
    createJSONKind(comment, name, value) {
        switch (apier_utils_1.kindOf(value)) {
            case apier_utils_1.ApierKind.INTEGER:
                return new ApierInteger(comment, name, value);
            case apier_utils_1.ApierKind.NUMBER:
                return new ApierNumber(comment, name, value);
            case apier_utils_1.ApierKind.STRING:
                return new ApierString(comment, name, value);
            case apier_utils_1.ApierKind.NULL:
                return new ApierNull(comment, name, value);
            case apier_utils_1.ApierKind.BOOLEAN:
                return new ApierBoolean(comment, name, value);
            case apier_utils_1.ApierKind.ARRAY:
                return new ApierArray(comment, name, value);
            case apier_utils_1.ApierKind.OBJECT:
                return new ApierObject(comment, name, value);
            default:
                throw new Error('unreachable');
        }
    }
    ;
}
exports.ApierItem = ApierItem;
class ApierReq extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = Object.keys(value).reduce((model, key) => {
            model[key] = this.createJSONKind(comment, key, value[key]);
            return model[key];
        }, {});
    }
}
exports.ApierReq = ApierReq;
class ApierRes extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        const { status, body } = value;
        this.model.status = status;
        if (body)
            this.model.body = this.createJSONKind(comment, 'body', body);
    }
}
exports.ApierRes = ApierRes;
class ApierNumber extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = false;
    }
}
exports.ApierNumber = ApierNumber;
class ApierInteger extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = false;
    }
}
exports.ApierInteger = ApierInteger;
class ApierString extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = false;
    }
}
exports.ApierString = ApierString;
class ApierBoolean extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = false;
    }
}
exports.ApierBoolean = ApierBoolean;
class ApierNull extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = false;
    }
}
exports.ApierNull = ApierNull;
class ApierArray extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = value.map((v, i) => this.createJSONKind(comment, String(i), v[i]));
    }
}
exports.ApierArray = ApierArray;
class ApierObject extends ApierItem {
    constructor(comment, name, value) {
        super(comment, name, value);
        this.model = Object.keys(value).reduce((model, key) => {
            model[key] = this.createJSONKind(comment, key, value[key]);
            return model[key];
        }, {});
    }
}
exports.ApierObject = ApierObject;
var Method;
(function (Method) {
    Method["GET"] = "get";
    Method["POST"] = "post";
    Method["PUT"] = "put";
    Method["DELETE"] = "delete";
})(Method = exports.Method || (exports.Method = {}));
class ParserError extends Error {
    constructor(paths, message) {
        super(message);
        this.paths = paths;
    }
}
exports.ParserError = ParserError;
class Apier extends ApierItem {
    constructor(comment, value) {
        super(comment, value.name, value);
        const model = {};
        if (value.req)
            model.req = new ApierReq(comment, 'req', value.req);
        model.res = new ApierRes(comment, 'res', value.res);
        this.model = model;
    }
}
exports.Apier = Apier;
//# sourceMappingURL=index.js.map