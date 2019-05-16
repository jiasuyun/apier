import { LineValue } from './helper';
import { ApierComment } from '@dee-contrib/apier-comment';
export default class Visitor {
    private lines;
    private comment;
    private paths;
    private numChild;
    private lineValue?;
    private parent?;
    constructor(lines: string[], comment: ApierComment, paths: string[]);
    error(line: string, lineIndex: number): Error;
    scopeArray(lineIndex: number): any;
    scopeObject(lineIndex: number): any;
    enterScope(lineValue: LineValue, lineIndex: number): any;
    exitScope(lineIndex: any): any;
    collectComment(paths: any, line: any): void;
}
