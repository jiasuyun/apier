import { colonToCurlybrace } from "@jiasuyun/apier-utils";
import { Apier } from "@jiasuyun/apier";
import { ApierRawReq, ApierRawRes } from "@jiasuyun/apier-parser-base";
import lget from "lodash/get";
import merge from "lodash/merge";

export type GeneratorResult = TestItem;

export type TestItem = TestGroup | TestUnit;

interface TestGroup {
  describe: string;
  units: TestItem[];
}

interface TestUnit {
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
    const meta = apier.comment.retriveMeta();
    const summary = apier.comment.retrive().val("summary", name) as string;
    const defaultUnit = {
      describe: summary,
      req: { method, url: colonToCurlybrace(url), ...req },
      res: res[0]
    };
    let units = loadUnits(meta);
    if (units.length === 0) {
      this.value = defaultUnit;
      return;
    }
    this.value = {
      describe: summary,
      units: meta.htte.units.map((unit, index) => {
        if (index === 0) {
          return merge({}, defaultUnit, unit);
        }
        unit.metadata = { skip: true };
        return unit;
      })
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
