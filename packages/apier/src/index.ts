import { ApierKind, kindOf } from '@dee-contrib/apier-utils';
import { ApierComment } from '@dee-contrib/apier-comment';

export abstract class ApierItem {
  public readonly comment: ApierComment;
  public readonly name: string;
  public readonly value: any;
  public model: any;
  constructor(comment: ApierComment, name: string, value: any) {
    this.comment = comment.scope(['name']);
    this.name = name;
    this.value = value;
  }
  public kind(): ApierKind {
    return kindOf(this.value);
  }
  public createJSONKind(comment: ApierComment, name: string, value: any): ApierJSONKind {
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


export interface ApierMap {
  [k: string]: Apier;
}

export type ApierJSONKind = ApierArray | ApierObject | ApierInteger | ApierString | ApierBoolean | ApierNull | ApierNumber;
export type ApierParameters = ApierInteger | ApierString | ApierBoolean | ApierNull | ApierNumber;
export interface ApierReqModel {
  params?: ApierParameters;
  query?: ApierParameters;
  headers?: ApierParameters;
  body?: ApierJSONKind;
}
export class ApierReq extends ApierItem {
  public readonly model: ApierReqModel;
  constructor(comment: ApierComment, name: string, value: ApierRawReq) {
    super(comment, name, value);
    this.model = Object.keys(value).reduce((model, key) => {
      model[key] = this.createJSONKind(comment, key, value[key]);
      return model[key];
    }, {});
  }
}
export interface ApierResModel {
  status: number;
  body?: ApierJSONKind;
}
export class ApierRes extends ApierItem {
  public readonly model: ApierResModel;
  constructor(comment: ApierComment, name: string, value: ApierRawRes) {
    super(comment, name, value);
    const { status, body } = value;
    this.model.status = status;
    if (body) this.model.body = this.createJSONKind(comment, 'body', body);
  }
}
export class ApierNumber extends ApierItem {
  public readonly model: boolean;
  constructor(comment: ApierComment, name: string, value: number) {
    super(comment, name, value);
    this.model = false;
  }
}

export class ApierInteger extends ApierItem {
  public readonly model: boolean;
  constructor(comment: ApierComment, name: string, value: number) {
    super(comment, name, value);
    this.model = false;
  }
}
export class ApierString extends ApierItem {
  public readonly model: boolean;
  constructor(comment: ApierComment, name: string, value: string) {
    super(comment, name, value);
    this.model = false;
  }
}
export class ApierBoolean extends ApierItem {
  public readonly model: boolean;
  constructor(comment: ApierComment, name: string, value: boolean) {
    super(comment, name, value);
    this.model = false;
  }
}
export class ApierNull extends ApierItem {
  public readonly model: boolean;
  constructor(comment: ApierComment, name: string, value: null) {
    super(comment, name, value);
    this.model = false;
  }
}
export type ApierArrayModel = ApierJSONKind[];
export class ApierArray extends ApierItem {
  public readonly model: ApierArrayModel;
  constructor(comment: ApierComment, name: string, value: any[]) {
    super(comment, name, value);
    this.model = value.map((v, i) => this.createJSONKind(comment, String(i), v[i]));
  }
}
export type ApierObjectModel = {
  [k: string]: ApierJSONKind;
}
export class ApierObject extends ApierItem {
  public readonly model: ApierObjectModel;
  constructor(comment: ApierComment, name: string, value: { [k: string]: any }) {
    super(comment, name, value);
    this.model = Object.keys(value).reduce((model, key) => {
      model[key] = this.createJSONKind(comment, key, value[key]);
      return model[key];
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
  public method: Method;
  public url: string;
  public model: ApierModel
  constructor(comment: ApierComment, value: ApierRaw) {
    super(comment, value.name, value);
    const model: any = {};
    if (value.req) model.req = new ApierReq(comment, 'req', value.req);
    model.res = new ApierRes(comment, 'res', value.res);
    this.model = model;
  }
}