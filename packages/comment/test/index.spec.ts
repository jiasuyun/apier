import { ApierComment } from '../src';
describe('ApierComment', () => {
  it('append & retrive', () => {
    const comment = new ApierComment();
    comment.append([], 'optional type=integer description="a b =c"');
    const commentUtil = comment.retrive();
    expect(commentUtil.val()).toEqual({ optional: true, type: 'integer', description: "a b =c" });
    comment.append(['a'], 'bool=true num=3.2 int=4 str=abc nil=null arr=[3] obj={"k":3}');
    const commentUtil2 = comment.retrive(['a']);
    expect(commentUtil2.val()).toEqual({ bool: true, num: 3.2, int: 4, str: 'abc', nil: null, arr: [3], obj: { k: 3 } });
  });
  it('scope', () => {
    const comment = new ApierComment();
    comment.append(['a'], 'k=1');
    comment.append(['b'], 'k=2');
    comment.append(['a', 'b'], 'k=3');
    expect(comment.scope(['a']).retrive().val('k')).toEqual(1);
    expect(comment.scope(['a', 'b']).retrive().val('k')).toEqual(3);
  });
})

describe('CommentUtil', () => {
  it('val', () => {
    const comment = new ApierComment();
    comment.append([], 'bool=true num=3.2 int=4');
    const commentUtil = comment.retrive();
    expect(commentUtil.val()).toEqual({ bool: true, num: 3.2, int: 4 });
    expect(commentUtil.val('bool')).toEqual(true);
    expect(commentUtil.val('foo', 3)).toEqual(3);
  });
  it('omit & pick', () => {
    const comment = new ApierComment();
    comment.append([], 'bool=true num=3.2 int=4 str=abc nil=null arr=[3] obj={"k":3}');
    const commentUtil = comment.retrive();
    expect(commentUtil.omit(['bool', 'num'])).toEqual({ int: 4, str: 'abc', nil: null, arr: [3], obj: { k: 3 } });
    expect(commentUtil.pick(['bool', 'num'])).toEqual({ bool: true, num: 3.2 });
  })
})