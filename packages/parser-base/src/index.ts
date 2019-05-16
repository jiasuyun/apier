import { ApierComment } from "@jiasuyun/apier-comment";

export interface ApierRaw {
  name: string;
  url: string;
  method: Method;
  req?: ApierRawReq;
  res: ApierRawRes;
}

export interface ApierRawObject {
  [k: string]: any;
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
  };
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

export enum Method {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete"
}
