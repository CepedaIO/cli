import AJV, { Options, ErrorObject, JSONSchemaType } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import chalk from "chalk";

function removeProperty(obj:Object, error: ErrorObject) {
  const path = error.instancePath.slice(1).split('/');
  const part = path.reduce((res, field) => {
    if(field !== '') {
      return res[field];
    }

    return res;
  }, obj);

  delete part[error.params.additionalProperty];
}

function removedUndefined(obj:Object) {
  for(const [key, value] of Object.entries(obj)) {
    if(typeof value === 'object') {
      obj[key] = removedUndefined(value);
    }

    if(value === undefined || value === null) {
      delete obj[key];
    }
  }

  return obj;
}
interface ValidateOptions {
  filterAdditionalProperties?: boolean,
  verbose?: boolean;
  removeUndefined?: boolean;
}

interface ValidateResult<T> {
  result: T,
  errors: ErrorObject[]
}

export function validateSchema<T>(obj:T, schema: JSONSchemaType<T>, options: ValidateOptions & Options): ValidateResult<T> {
  const ajv = new AJV({
    allowUnionTypes: true,
    allErrors: true,
    ...options
  });

  addFormats(ajv);

  const validate = ajv.compile(schema);
  const valid = validate(obj);
  let errors = validate.errors || [];

  if(!valid && options.filterAdditionalProperties) {
    const additionalErrors = errors.filter((error) => error.keyword === "additionalProperties");

    additionalErrors.forEach((error) => removeProperty(obj, error));

    if(options.verbose && additionalErrors.length > 0) {
      const fields = additionalErrors.reduce((res, error) => res.concat(`${error.instancePath}/${error.params.additionalProperty}`), [] as string[]);
      console.log(`Additional Properties Found:\n\t${chalk.yellowBright(fields.join('\n\t'))}`);
    }

    errors = errors.filter((error) => error.keyword !== "additionalProperties");
  }

  return {
    result: removedUndefined(obj) as T,
    errors
  }
}