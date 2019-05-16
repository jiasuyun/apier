"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Generator {
    constructor(apier) {
        this.value = `export async function ${apier.name}(req: Request, res: Response) {}`;
    }
}
exports.Generator = Generator;
//# sourceMappingURL=index.js.map