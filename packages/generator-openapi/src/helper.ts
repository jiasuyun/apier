export function omitEmptyObject(obj: any) {
  let omit = value => {
    if (Array.isArray(value)) {
      value = value.map(v => omit(v)).filter(v => !isEmpty(v));
    } 
    if (isObject(value)) {
      let result = {};
      for (let key of Object.keys(value)) {
        let val = omit(value[key]);
        if (val !== undefined) {
          result[key] = val;
        }
      }
      value = result;
    }

    if (!isEmpty(value)) {
      return value;
    }
  };

  let res = omit(obj);
  if (res === undefined) {
    return typeof obj === "object" ? {} : res;
  }
  return res;
}

function isEmpty(value) {
  if (value === undefined) return true;
  return isObject(value) && Object.keys(value).length === 0;
}

function isObject(value) {
  return typeof(value) === "object" && !Array.isArray(value)
}