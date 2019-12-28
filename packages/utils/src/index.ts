export function kindOf(value: any): ApierKind {
  if (value === null) {
    return ApierKind.NULL;
  }
  if (value === undefined) {
    return ApierKind.NULL;
  }
  switch (typeof value) {
    case "boolean":
      return ApierKind.BOOLEAN;
    case "number":
      if (Number.isInteger(value)) {
        return ApierKind.INTEGER;
      }
      return ApierKind.NUMBER;
    case "string":
      return ApierKind.STRING;
    default:
      if (Array.isArray(value)) {
        return ApierKind.ARRAY;
      }
      return ApierKind.OBJECT;
  }
}

export enum ApierKind {
  NUMBER = "number",
  INTEGER = "integer",
  STRING = "string",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
  NULL = "null"
}

// 路径 `/model/:id` => `/model/{id}`
export function colonToCurlybrace(url: string): string {
  return url.replace(/\/:([A-Za-z0-9_]+)/g, "/{$1}");
}

// 重新调整对象字段顺序
export function reorder(value: any, orders: string[]) {
  if (!isObject(value)) return;
  const keys = Object.keys(value);
  const tmp = keys.reduce((a, c) => {
    a[c] = value[c];
    delete value[c];
    return a;
  }, {});
  const sortedKeys = keys.sort((a, b) => orders.indexOf(a) - orders.indexOf(b));
  sortedKeys.forEach(key => (value[key] = tmp[key]));
}

export const KEEP_EMPTY_OBJECT: string = Symbol("any") as any;

// 移除空对象
export function omitEmptyObject(value: any) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      omitEmptyObject(value[i]);
      if (isEmpty(value[i])) {
        value.splice(i, 1);
        i--;
      }
    }
  }
  if (isObject(value)) {
    for (const key in value) {
      omitEmptyObject(value[key]);
      if (value[key][KEEP_EMPTY_OBJECT] === true) {
        value[key] = {}
      } else if (isEmpty(value[key])) {
        delete value[key];
      }
    }
  }
}

function isEmpty(value) {
  if (value === undefined) return true;
  return isObject(value) && Object.keys(value).length === 0;
}

function isObject(value) {
  return typeof value === "object" && !Array.isArray(value);
}
