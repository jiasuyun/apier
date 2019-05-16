import { ApierKind } from '@dee-contrib/apier-utils';
import { ApierComment } from '@dee-contrib/apier-comment';
export declare abstract class ApierItem {
    readonly comment: ApierComment;
    readonly name: string;
    readonly value: any;
    model: any;
    constructor(comment: ApierComment, name: string, value: any);
    kind(): ApierKind;
    createJSONKind(comment: ApierComment, name: string, value: any): ApierJSONKind;
}
export interface ApierMap {
    [k: string]: Apier;
}
export declare type ApierJSONKind = ApierArray | ApierObject | ApierInteger | ApierString | ApierBoolean | ApierNull | ApierNumber;
export declare type ApierParameters = ApierInteger | ApierString | ApierBoolean | ApierNull | ApierNumber;
export interface ApierReqModel {
    params?: ApierParameters;
    query?: ApierParameters;
    headers?: ApierParameters;
    body?: ApierJSONKind;
}
export declare class ApierReq extends ApierItem {
    readonly model: ApierReqModel;
    constructor(comment: ApierComment, name: string, value: ApierRawReq);
}
export interface ApierResModel {
    status: number;
    body?: ApierJSONKind;
}
export declare class ApierRes extends ApierItem {
    readonly model: ApierResModel;
    constructor(comment: ApierComment, name: string, value: ApierRawRes);
}
export declare class ApierNumber extends ApierItem {
    readonly model: boolean;
    constructor(comment: ApierComment, name: string, value: number);
}
export declare class ApierInteger extends ApierItem {
    readonly model: boolean;
    constructor(comment: ApierComment, name: string, value: number);
}
export declare class ApierString extends ApierItem {
    readonly model: boolean;
    constructor(comment: ApierComment, name: string, value: string);
}
export declare class ApierBoolean extends ApierItem {
    readonly model: boolean;
    constructor(comment: ApierComment, name: string, value: boolean);
}
export declare class ApierNull extends ApierItem {
    readonly model: boolean;
    constructor(comment: ApierComment, name: string, value: null);
}
export declare type ApierArrayModel = ApierJSONKind[];
export declare class ApierArray extends ApierItem {
    readonly model: ApierArrayModel;
    constructor(comment: ApierComment, name: string, value: any[]);
}
export declare type ApierObjectModel = {
    [k: string]: ApierJSONKind;
};
export declare class ApierObject extends ApierItem {
    readonly model: ApierObjectModel;
    constructor(comment: ApierComment, name: string, value: {
        [k: string]: any;
    });
}
export declare enum Method {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
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
    };
    comment: ApierComment;
}
export interface Parser {
    parse(input: string): ParseResult;
}
export declare class ParserError extends Error {
    readonly paths: string[];
    constructor(paths: string[], message: string);
}
export interface ApierModel {
    req?: ApierReq;
    res: ApierRes;
}
export declare class Apier extends ApierItem {
    method: Method;
    url: string;
    model: ApierModel;
    constructor(comment: ApierComment, value: ApierRaw);
}
