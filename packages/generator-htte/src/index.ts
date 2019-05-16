import { colonToCurlybrace } from '@dee-contrib/apier-utils';
import * as apier from '@dee-contrib/apier';

export interface GeneratorResult {
  describe: string;
  req: {
    method: string;
    url: string;
  } & apier.ApierRawReq;
  res: apier.ApierRawRes;
}

export class Generator {
  public readonly value: GeneratorResult;
  constructor(apier: apier.Apier) {
    const { method, url, name, value: { req, res } } = apier;
    const summary = apier.comment.retrive().val('summary', name) as string;
    this.value = {
      describe: summary,
      req: { method, url: colonToCurlybrace(url), ...req },
      res
    }
  }
}