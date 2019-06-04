import * as apier from "@jiasuyun/apier";
import { ApierKind } from "@jiasuyun/apier-utils";
import { Method } from "@jiasuyun/apier-parser-base";

export interface GeneratorResult {
  name: string;
  method: Method;
  url: string;
  data: any;
  useMock: boolean;
}
export default class Generator {
  private readonly api: apier.Apier;
  public readonly value: GeneratorResult;
  private circularSchemas: any = {};
  private useMock = false;
  constructor(apier: apier.Apier) {
    this.api = apier;
    const res = apier.model.res[0];
    const commentUtil = res.comment.retrive();
    let body = res.model.body;
    if (commentUtil.val("useSchema")) {
      let ref = apier.refs[commentUtil.val("useSchema")];
      body = ref.model.body;
    }
    const { name, method, url } = apier;
    this.value = { name, method, url, data: null, useMock: false };
    if (!body) {
      return;
    }
    const setValueFn = (v, mockKey = "") => {
      if (this.useMock) {
        this.value.useMock = true;
        this.value.data = {
          ["mock" + mockKey]: v
        };
        return;
      }
      this.value.data = v;
    };
    this.generateUtil(setValueFn, body);
  }
  private generateUtil(fn: SetValueFn, item: apier.ApierJSONKind) {
    if (!item) return; // FIXME: maybe throw error
    const commentUtil = item.comment.retrive();
    if (commentUtil.val("useSchema")) {
      const useSchema = commentUtil.val("useSchema");
      const circularSchemaKey = useSchema + "_" + item.name;
      const circularSchema = this.circularSchemas[circularSchemaKey];
      if (!circularSchema) {
        this.circularSchemas[circularSchemaKey] = true;
        this.generateUtil(fn, this.api.refs[useSchema]);
      }
      return;
    }
    const [mockValue, mockKey] = this.parseUseMock(commentUtil.val("useMock"));
    let value: any;
    switch (item.kind()) {
      case ApierKind.ARRAY:
        value = [];
        item.model.forEach((childItem, index) => {
          this.generateUtil(v => (value[index] = v), childItem);
        });
        fn(value, mockKey);
        return;
      case ApierKind.OBJECT:
        value = {};
        Object.keys(item.model).forEach(key => {
          this.generateUtil(v => (value[key] = v), item.model[key]);
        });
        fn(value, mockKey);
        return;
      default:
        value = mockValue || item.value;
        fn(value, mockKey);
        return;
    }
  }
  private parseUseMock(useMock?: string) {
    if (!useMock) {
      return ["", ""];
    }
    this.useMock = true;
    let [mockValue, mockKey = ""] = useMock.split("|");
    if (mockKey) {
      mockKey = "|" + mockKey;
    }
    return [mockValue, mockKey];
  }
}

type SetValueFn = (v: any, mockKey: string) => void;
