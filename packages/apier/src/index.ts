import { ApierKind, kindOf } from '@dee-contrib/apier-utils';
import { ApierComment } from '@dee-contrib/apier-comment';

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
        throw new Error('unreachable');
    }
  };
}

export interface ApierRawObject {
  [k: string]: any;
}

export type ApierJSONKind = ApierArray | ApierObject | ApierParameter
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
    if (body) this.model.body = this.createJSONKind(this.comment, 'body', body);
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
export type ApierObjectModel = {
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

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export interface ApierRaw {
  name: string;
  url: string;
  method: Method;
  req?: ApierRawReq;
  res: ApierRawRes;
}

export interface ApierRawReq {
  params?: ApierRawParameters;
  query?: ApierRawParameters;
  headers?: ApierRawParameters;
  body?: any;
}

export interface ApierRawParameters {
  [k: string]: number | string | null | boolean;
}

export interface ApierRawRes {
  status?: number;
  body?: any;
}

export interface ParseResult {
  apis: {
    [k: string]: ApierRaw;
  }
  comment: ApierComment;
}

export interface Parser {
  parse(input: string): ParseResult;
}

export class ParserError extends Error {
  public readonly paths: string[];
  constructor(paths: string[], message: string) {
    super(message);
    this.paths = paths;
  }
}

export interface ApierModel {
  req?: ApierReq;
  res: ApierRes;
}
export class Apier extends ApierItem {
  public readonly method: Method;
  public readonly url: string;
  public readonly model: ApierModel
  public readonly value: ApierRaw;
  constructor(comment: ApierComment, value: ApierRaw) {
    super(comment, value.name, value);
    this.method = value.method;
    this.url = value.url;
    const model: any = {};
    if (value.req) model.req = new ApierReq(this.comment, 'req', value.req);
    model.res = new ApierRes(this.comment, 'res', value.res);
    this.model = model;
  }
}

export function parse(input: string, parser: Parser): Apier[] {
  const result = [];
  const { apis, comment } = parser.parse(input);
  for (const name in apis) {
    result.push(new Apier(comment, apis[name]));
  }
  return result;
}