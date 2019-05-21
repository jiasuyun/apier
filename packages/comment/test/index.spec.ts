import { ApierComment } from "../src";
describe("ApierComment", () => {
  it("append", () => {
    const comment = new ApierComment();
    comment.append([], 'bool=true num=3.2 int=4 str="a b =c" nil=null arr=[3] obj={"k":3} a.b[0].c=3');
    const commentUtil = comment.retrive();
    expect(commentUtil.val()).toEqual({
      bool: true,
      num: 3.2,
      int: 4,
      str: "a b =c",
      nil: null,
      arr: [3],
      obj: { k: 3 },
      a: { b: [{ c: 3 }] }
    });
  });
  it("append: merge", () => {
    const comment = new ApierComment();
    comment.append([], "a=3");
    comment.append([], "b=4");
    expect(comment.retrive().val()).toEqual({ a: 3, b: 4 });
  });
  it("scope", () => {
    const comment = new ApierComment();
    comment.append(["a"], "k=1");
    comment.append(["b"], "k=2");
    comment.append(["a", "b"], "k=3");
    expect(
      comment
        .scope(["a"])
        .retrive()
        .val("k")
    ).toEqual(1);
    expect(
      comment
        .scope(["a", "b"])
        .retrive()
        .val("k")
    ).toEqual(3);
  });
  it("retrive", () => {
    const comment = new ApierComment();
    comment.append(["a"], "k=1");
    comment.append(["b"], "k=2");
    comment.append(["a", "b"], "k=3");
    expect(comment.retrive().val()).toEqual({});
    expect(comment.retrive(["a"]).val()).toEqual({ k: 1 });
    expect(comment.retrive(["a", "b"]).val()).toEqual({ k: 3 });
  });
  it("changePaths", () => {
    const comment = new ApierComment();
    comment.append(["a", "b"], "k=1");
    comment.append(["a", "b", "c"], "k=2");
    comment.changePaths(["a", "b"], ["a", "d"]);
    expect(comment.retrive(["a", "d"]).val()).toEqual({ k: 1 });
    expect(comment.retrive(["a", "d", "c"]).val()).toEqual({ k: 2 });
  });
});

describe("CommentUtil", () => {
  it("val", () => {
    const comment = new ApierComment();
    comment.append([], "bool=true num=3.2 int=4");
    const commentUtil = comment.retrive();
    expect(commentUtil.val()).toEqual({ bool: true, num: 3.2, int: 4 });
    expect(commentUtil.val("bool")).toEqual(true);
    expect(commentUtil.val("foo", 3)).toEqual(3);
  });
  it("omit & pick", () => {
    const comment = new ApierComment();
    comment.append([], 'bool=true num=3.2 int=4 str=abc nil=null arr=[3] obj={"k":3}');
    const commentUtil = comment.retrive();
    expect(commentUtil.omit(["bool", "num"])).toEqual({
      int: 4,
      str: "abc",
      nil: null,
      arr: [3],
      obj: { k: 3 }
    });
    expect(commentUtil.pick(["bool", "num"])).toEqual({ bool: true, num: 3.2 });
  });
  it("val by jsonpath", () => {
    const comment = new ApierComment();
    comment.append([], "a.b[0].c=3");
    const commentUtil = comment.retrive();
    expect(commentUtil.val()).toEqual({ a: { b: [{ c: 3 }] } });
    expect(commentUtil.val("a.b[0].c")).toEqual(3);
  });
});
