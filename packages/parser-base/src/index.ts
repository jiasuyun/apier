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

export class ContentParserError extends Error {
  public readonly lineNumber: number;
  public readonly columnNumber: number;
  public readonly underlayError: Error;
  constructor(lineNumber: number, columnNumber: number, err: Error) {
    super(`Parser: invalid content at ${lineNumber}:${columnNumber}`);
    this.columnNumber = columnNumber;
    this.lineNumber = lineNumber;
    this.underlayError = err;
  }
}

export class StructParserError extends Error {
  public readonly paths: string[];
  constructor(paths: string[], message: string) {
    super(`Parser: ${paths.join(".")} ${message}`);
    this.paths = paths;
  }
}

export class CommentParserError extends Error {
  public readonly lineNumber: number;
  public readonly line: string;
  constructor(lineNumber: number, line: string, message = "invalid line") {
    super(`Parser: ${message} at ${lineNumber}`);
    this.line = line;
    this.lineNumber = lineNumber;
  }
}

export enum Method {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete"
}
