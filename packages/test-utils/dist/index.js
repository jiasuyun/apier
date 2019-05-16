"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function loadFixtureJSON5(name) {
    return fs.readFileSync(path.resolve(__dirname, `../src/fixtures/${name}.json5`), 'utf8');
}
exports.loadFixtureJSON5 = loadFixtureJSON5;
function loadFixtureJSON(name) {
    return require(path.resolve(__dirname, `../src/fixtures/${name}.json`));
}
exports.loadFixtureJSON = loadFixtureJSON;
//# sourceMappingURL=index.js.map