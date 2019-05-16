export declare enum LineKind {
    ARRAY = "array",
    OBJECT = "object",
    KV = "kv",
    EXIT = "exit",
    EMPTY = "empty"
}
export interface LineValue {
    kind: LineKind;
    key?: string;
}
/**
 * 获取行值
 */
export declare function valueOfLine(line: string): LineValue;
/**
 * 起始行号
 */
export declare function beignLineNum(lines: string[]): number;
/**
 * 提取注释部分
 */
export declare function getLineComment(line: string): string;
