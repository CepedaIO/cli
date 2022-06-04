export function removeFields(obj: Object, fields: string[]): Object {
  return Object.entries(obj).reduce((res, [field, value]) => {
    if(value !== null && value !== undefined && !fields.includes(field)) {
      res[field] = value;
    }

    return res;
  }, {});
}

export function filterFields(obj:Object, fields: string[]): Object {
  return Object.entries(obj).reduce((res, [field, value]) => {
    if(value !== null && value !== undefined && fields.includes(field)) {
      res[field] = value;
    }

    return res;
  }, {});
}