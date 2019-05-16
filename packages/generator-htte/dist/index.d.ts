import * as apier from '@dee-contrib/apier';
export interface GeneratorResult {
    describe: string;
    req: {
        method: string;
        url: string;
    } & apier.ApierRawReq;
    res: apier.ApierRawRes;
}
export default class Generator {
    readonly value: GeneratorResult;
    constructor(apier: apier.Apier);
}
