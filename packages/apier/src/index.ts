import { ApierKind, kindOf } from '@dee-contrib/apier-utils';

export interface ApierComments {
  [k: string]: any;
}

export abstract class ValueComments {
  public readonly value: any;
  public readonly comments: ApierComments;
}

export abstract class ApierItem extends ValueComments {
  public kind(): ApierKind {
    return kindOf(this.value);
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