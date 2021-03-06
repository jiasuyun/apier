import { colonToCurlybrace } from "@jiasuyun/apier-utils";
import { Apier } from "@jiasuyun/apier";
import { ApierRawReq, ApierRawRes, Method } from "@jiasuyun/apier-parser-base";
import lget from "lodash/get";
import merge from "lodash/merge";

export interface GeneratorResult {
  define: Define;
  test: TestItem;
}

export type TestItem = TestGroup | TestUnit;

interface Define {
  [k: string]: {
    req: {
      method: Method;
      url: string;
    }
  };
}

interface TestGroup {
  describe: string;
  units: TestItem[];
}

interface TestUnit {
  describe: string;
  includes: string;
  req: ApierRawReq;
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
    const meta = apier.comment.retriveMeta();
    const summary = apier.comment.retrive().val("summary", name) as string;
    const test = {
      describe: summary,
      includes: name,
      req: req,
      res: res[0]
    };
    const define = { [name]: { req: { method, url: colonToCurlybrace(url) } } };
    let units = loadUnits(meta);
    if (units.length === 0) {
      this.value = { test, define };
      return;
    }
    this.value = {
      test: {
        describe: summary,
        units: meta.htte.units.map((unit, index) => {
          if (index === 0) {
            return merge(test, unit);
          }
          unit.includes = name;
          unit.metadata = { skip: true };
          return unit;
        })
      },
      define
    };
  }
}

interface UnitObj {
  describe: string;
  [k: string]: any;
}

function loadUnits(meta: any): UnitObj[] {
  let units = lget(meta, ["htte", "units"]);
  if (!Array.isArray(units)) {
    return [];
  }
  units = units.filter(u => u.describe);
  return units;
}
