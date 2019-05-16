"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apier_utils_1 = require("@dee-contrib/apier-utils");
class Generator {
    constructor(apier) {
        const { method, url, name, value: { req, res } } = apier;
        const summary = apier.comment.retrive().val('summary', name);
        this.value = {
            describe: summary,
            req: Object.assign({ method, url: apier_utils_1.colonToCurlybrace(url) }, req),
            res
        };
    }
}
exports.Generator = Generator;
//# sourceMappingURL=index.js.map