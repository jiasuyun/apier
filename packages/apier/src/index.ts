import { ApierRaw, ApierRawObject, ApierRawReq, ApierRawRes, Method, Parser } from "@jiasuyun/apier-parser-base";
import { ApierKind, kindOf } from "@jiasuyun/apier-utils";
import { ApierComment, CommentItem } from "@jiasuyun/apier-comment";

export abstract class ApierItem {
  public readonly comment: ApierComment;
  public readonly name: string;
  public readonly value: any;
  public readonly model: any;
  constructor(comment: ApierComment, name: string, value: any) {
    this.comment = comment.scope([name]);
    this.name = name;
    this.value = value;
  }
  public kind(): ApierKind {
    return kindOf(this.value);
  }
  protected createJSONKind(comment: ApierComment, name: string, value: any): ApierJSONKind {
    switch (kindOf(value)) {
      case ApierKind.INTEGER:
        return new ApierInteger(comment, name, value);
      case ApierKind.NUMBER:
        return new ApierNumber(comment, name, value);
      case ApierKind.STRING:
        return new ApierString(comment, name, value);
      case ApierKind.NULL:
        return new ApierNull(comment, name, value);
      case ApierKind.BOOLEAN:
        return new ApierBoolean(comment, name, value);
      case ApierKind.ARRAY:
        return new ApierArray(comment, name, value);
      case ApierKind.OBJECT:
        return new ApierObject(comment, name, value);
      default:
        throw new Error("unexpect undefined value");
    }
  }
}

export type ApierJSONKind = ApierArray | ApierObject | ApierParameter;
export type ApierParameter = ApierInteger | ApierString | ApierBoolean | ApierNull | ApierNumber;
export interface ApierReqModel {
  params?: ApierObject;
  query?: ApierObject;
  headers?: ApierObject;
  body?: ApierJSONKind;
}
export class ApierReq extends ApierItem {
  public readonly model: ApierReqModel;
  public readonly value: ApierRawReq;
  constructor(comment: ApierComment, name: string, value: ApierRawReq) {
    super(comment, name, value);
    this.model = Object.keys(value).reduce((model, key) => {
      model[key] = this.createJSONKind(this.comment, key, value[key]);
      return model;
    }, {});
  }
}
export interface ApierResModel {
  status: number;
  body?: ApierJSONKind;
}
export class ApierRes extends ApierItem {
  public readonly model: ApierResModel;
  public readonly value: ApierRawRes;
  constructor(comment: ApierComment, name: string, value: ApierRawRes) {
    super(comment, name, value);
    const { status, body } = value;
    this.model = { status };
    if (body) this.model.body = this.createJSONKind(this.comment, "body", body);
  }
}
export class ApierNumber extends ApierItem {
  public readonly model = null;
  public readonly value: number;
  constructor(comment: ApierComment, name: string, value: number) {
    super(comment, name, value);
  }
}

export class ApierInteger extends ApierItem {
  public readonly model = null;
  public readonly value: number;
  constructor(comment: ApierComment, name: string, value: number) {
    super(comment, name, value);
  }
}
export class ApierString extends ApierItem {
  public readonly model = null;
  public readonly value: string;
  constructor(comment: ApierComment, name: string, value: string) {
    super(comment, name, value);
  }
}
export class ApierBoolean extends ApierItem {
  public readonly model = null;
  public readonly value: boolean;
  constructor(comment: ApierComment, name: string, value: boolean) {
    super(comment, name, value);
  }
}
export class ApierNull extends ApierItem {
  public readonly model = null;
  public readonly value: null;
  constructor(comment: ApierComment, name: string, value: null) {
    super(comment, name, value);
  }
}
export type ApierArrayModel = ApierJSONKind[];
export class ApierArray extends ApierItem {
  public readonly model: ApierArrayModel;
  public readonly value: any[];
  constructor(comment: ApierComment, name: string, value: any[]) {
    super(comment, name, value);
    this.model = value.map((v, i) => this.createJSONKind(this.comment, String(i), v));
  }
}
export interface ApierObjectModel {
  [k: string]: ApierJSONKind;
}

export class ApierObject extends ApierItem {
  public readonly model: ApierObjectModel;
  public readonly value: ApierRawObject;
  constructor(comment: ApierComment, name: string, value: ApierRawObject) {
    super(comment, name, value);
    this.model = Object.keys(value).reduce((model, key) => {
      model[key] = this.createJSONKind(this.comment, key, value[key]);
      return model;
    }, {});
  }
}

export interface ApierModel {
  req?: ApierReq;
  res: ApierRes[];
}
export class Apier extends ApierItem {
  public readonly method: Method;
  public readonly url: string;
  public readonly value: ApierRaw;
  public readonly model: ApierModel;
  constructor(comment: ApierComment, value: ApierRaw) {
    super(comment, value.name, value);
    this.method = value.method;
    this.url = value.url;
    const model: any = {};
    if (value.req) model.req = new ApierReq(this.comment, "req", value.req);
    model.res = value.res.map((res, i) => new ApierRes(this.comment.scope(["res"]), "" + i, res));
    this.model = model;
  }
}

export interface ParseResult {
  apis: {
    [k: string]: ApierRaw;
  };
  comments: CommentItem[];
  apiers: Apier[];
  metadata: any;
}

export function parse(input: string, parser: Parser): ParseResult {
  const apiers = [];
  const { apis, comment } = parser.parse(input);
  for (const name in apis) {
    apiers.push(new Apier(comment, apis[name]));
  }
  const metadata = comment.retrive([]).val();
  return { apis, apiers, comments: comment.comments, metadata };
}
