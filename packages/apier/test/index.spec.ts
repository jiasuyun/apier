import * as apier from "../src";
import { loadFixtureJSON5, loadFixtureJSON } from "@jiasuyun/apier-test-utils";
import Parser from "@jiasuyun/apier-parser-json5";
import { ApierKind } from "@jiasuyun/apier-utils";
import { ApierComment } from "@jiasuyun/apier-comment";

test("Apier", () => {
  const api = getApier();
  const comment = new ApierComment(loadFixtureJSON("general.comments")).scope(["getModel"]);
  expect(api).toBeInstanceOf(apier.Apier);
  expect(api.name).toEqual("getModel");
  expect(api.kind()).toEqual(ApierKind.OBJECT);
  expect(api.method).toEqual("get");
  expect(api.url).toEqual("/model/:id");
  expect(api.comment.comments).toEqual(comment.comments);
});

test("ApierReq", () => {
  const api = getApier();
  const req = api.model.req;
  expect(req).toBeInstanceOf(apier.ApierReq);
  expect(req.name).toEqual("req");
  expect(req.kind()).toEqual(ApierKind.OBJECT);
  expect(req.value).toEqual(api.value.req);
  expect(req.comment.comments).toEqual(api.comment.scope(["req"]).comments);
});

test("ApierRes", () => {
  const api = getApier();
  const res = api.model.res;
  expect(res).toBeInstanceOf(apier.ApierRes);
  expect(res.name).toEqual("res");
  expect(res.kind()).toEqual(ApierKind.OBJECT);
  expect(res.value).toEqual(api.value.res);
  expect(res.comment.comments).toEqual(api.comment.scope(["res"]).comments);
});

test("ApierReq {headers, params, query, body}", () => {
  const api = getApier();
  const { headers, params, query, body } = api.model.req.model;
  expect(headers).toBeInstanceOf(apier.ApierObject);
  expect(headers.name).toEqual("headers");
  expect(headers.kind()).toEqual(ApierKind.OBJECT);
  expect(headers.value).toEqual(api.value.req.headers);
  expect(headers.comment.comments).toEqual(api.comment.scope(["req", "headers"]).comments);
  expect(headers.model["X-ORG-ID"]).toBeInstanceOf(apier.ApierInteger);
  expect(params).toBeInstanceOf(apier.ApierObject);
  expect(params.name).toEqual("params");
  expect(params.kind()).toEqual(ApierKind.OBJECT);
  expect(params.value).toEqual(api.value.req.params);
  expect(params.comment.comments).toEqual(api.comment.scope(["req", "params"]).comments);
  expect(params.model["id"]).toBeInstanceOf(apier.ApierInteger);
  expect(query).toBeInstanceOf(apier.ApierObject);
  expect(query.name).toEqual("query");
  expect(query.kind()).toEqual(ApierKind.OBJECT);
  expect(query.value).toEqual(api.value.req.query);
  expect(query.comment.comments).toEqual(api.comment.scope(["req", "query"]).comments);
  expect(query.model["pageSize"]).toBeInstanceOf(apier.ApierInteger);
  expect(body).toBeInstanceOf(apier.ApierObject);
  expect(body.name).toEqual("body");
  expect(body.kind()).toEqual(ApierKind.OBJECT);
  expect(body.value).toEqual(api.value.req.body);
  expect(body.comment.comments).toEqual(api.comment.scope(["req", "body"]).comments);
  expect(body.model["number"]).toBeInstanceOf(apier.ApierNumber);
});

test("ApierRes {status, body}", () => {
  const api = getApier();
  const { status, body } = api.model.res.model;
  expect(status).toEqual(200);
  expect(body).toBeInstanceOf(apier.ApierObject);
  expect(body.name).toEqual("body");
  expect(body.kind()).toEqual(ApierKind.OBJECT);
  expect(body.value).toEqual(api.value.res.body);
  expect(body.comment.comments).toEqual(api.comment.scope(["res", "body"]).comments);
  expect(body.model["number"]).toBeInstanceOf(apier.ApierNumber);
});

test("ApierNumber", () => {
  const api = getApier();
  const key = "number";
  const item: apier.ApierNumber = api.model.res.model.body.model[key];
  expect(item).toBeInstanceOf(apier.ApierNumber);
  expect(item.name).toEqual(key);
  expect(item.value).toEqual(api.value.res.body[key]);
  expect(item.model).toEqual(null);
  expect(item.comment.retrive().val()).toEqual({ format: "float" });
});

test("ApierBool", () => {
  const api = getApier();
  const key = "bool";
  const item: apier.ApierNumber = api.model.res.model.body.model[key];
  expect(item).toBeInstanceOf(apier.ApierBoolean);
  expect(item.name).toEqual(key);
  expect(item.value).toEqual(api.value.res.body[key]);
  expect(item.model).toEqual(null);
  expect(item.comment.retrive().val()).toEqual({});
});

test("ApierInteger", () => {
  const api = getApier();
  const key = "integer";
  const item: apier.ApierInteger = api.model.res.model.body.model[key];
  expect(item).toBeInstanceOf(apier.ApierInteger);
  expect(item.name).toEqual(key);
  expect(item.value).toEqual(api.value.res.body[key]);
  expect(item.model).toEqual(null);
  expect(item.comment.retrive().val()).toEqual({ format: "int64" });
});

test("ApierString", () => {
  const api = getApier();
  const key = "password";
  const item: apier.ApierString = api.model.res.model.body.model["object"].model[key];
  expect(item).toBeInstanceOf(apier.ApierString);
  expect(item.name).toEqual(key);
  expect(item.value).toEqual(api.value.res.body["object"][key]);
  expect(item.model).toEqual(null);
  expect(item.comment.retrive().val()).toEqual({ minLength: 6 });
});

test("ApierNull", () => {
  const api = getApier();
  const key = "null";
  const item: apier.ApierNull = api.model.res.model.body.model[key];
  expect(item).toBeInstanceOf(apier.ApierNull);
  expect(item.name).toEqual(key);
  expect(item.value).toEqual(api.value.res.body[key]);
  expect(item.model).toEqual(null);
  expect(item.comment.retrive().val()).toEqual({});
});

test("ApierArray", () => {
  const api = getApier();
  const key = "array";
  const item: apier.ApierArray = api.model.res.model.body.model[key];
  expect(item).toBeInstanceOf(apier.ApierArray);
  expect(item.name).toEqual(key);
  expect(item.value).toEqual(api.value.res.body[key]);
  expect(item.comment.retrive().val()).toEqual({ mixItems: 3 });
  expect(item.model.length).toEqual(2);
  expect(item.model[0]).toBeInstanceOf(apier.ApierObject);
  expect(item.model[0].model["foo"]).toBeInstanceOf(apier.ApierInteger);
  expect(item.model[1]).toBeInstanceOf(apier.ApierObject);
});

function getApier(): apier.Apier {
  const input = loadFixtureJSON5("general");
  const parser = new Parser();
  return apier.parse(input, parser)[0];
}
