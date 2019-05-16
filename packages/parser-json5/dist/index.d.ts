import * as apier from '@dee-contrib/apier';
export default class Parser implements apier.Parser {
    parse(input: string): apier.ParseResult;
    private parseApi;
    private parseComment;
    private parseRoute;
    private parseReq;
    private parseRes;
    private parseParameters;
    private parseResStatus;
    private parseBody;
}
