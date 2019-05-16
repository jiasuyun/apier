"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apier = __importStar(require("@jiasuyun/apier"));
const apier_parser_json5_1 = __importDefault(require("@jiasuyun/apier-parser-json5"));
const apier_test_utils_1 = require("@jiasuyun/apier-test-utils");
function loadApiers(name) {
    const input = apier_test_utils_1.loadFixtureJSON5(name);
    const parser = new apier_parser_json5_1.default();
    return apier.parse(input, parser);
}
exports.loadApiers = loadApiers;
//# sourceMappingURL=index.js.map