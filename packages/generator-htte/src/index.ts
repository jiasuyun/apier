import { colonToCurlybrace } from "@jiasuyun/apier-utils";
import { Apier } from "@jiasuyun/apier";
import { ApierRawReq, ApierRawRes } from "@jiasuyun/apier-parser-base";

export interface GeneratorResult {
  describe: string;
  req: {
    method: string;
    url: string;
  } & ApierRawReq;
  res: ApierRawRes;
}

export default class Generator {
  public readonly value: GeneratorResult;
  constructor(apier: Apier) {
    const {
      method,
      url,
      name,
      value: { req, res }
    } = apier;
    const summary = apier.comment.retrive().val("summary", name) as string;
    this.value = {
      describe: summary,
      req: { method, url: colonToCurlybrace(url), ...req },
      res: res[0]
    };
  }
}
