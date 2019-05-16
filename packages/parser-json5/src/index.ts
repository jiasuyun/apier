export enum ApierKind {
  NUMBER = 'number',
  INTEGER = 'integer',
  STRING = 'string',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  NULL = 'null',
}

export interface ApierComments {
  [k: string]: any;
}

export abstract class ValueComments {
  public readonly value: any;
  public readonly comments: ApierComments;
}

export abstract class ApierItem extends ValueComments {
  public static kindOf(value: any): ApierKind {
    if (value === null) {
      return ApierKind.NULL;
    }
    switch (typeof value) {
      case 'boolean':
        return ApierKind.BOOLEAN;
      case 'number':
        if (Number.isInteger(value)) {
          return ApierKind.INTEGER;
        }
        return ApierKind.NUMBER;
      case 'string':
        return ApierKind.STRING;
      default:
        if (Array.isArray(value)) {
          return ApierKind.ARRAY;
        }
        return ApierKind.OBJECT;
    }
  }
  public kind(): ApierKind {
    return ApierItem.kindOf(this.value);
  }
}

export class ApierNumber extends ApierItem {

}

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export class Apier extends ValueComments {
  public readonly method: Method;
  public readonly url: string;
}