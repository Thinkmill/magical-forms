import { Field } from "./types";
import { getScalarFieldInstance } from "./scalar";
import { getObjectFieldInstance } from "./object";
import { getArrayFieldInstance } from "./array";

export function getValueFromState(field: Field, state: any): any {
  if (field.kind === "scalar") {
    return state.value;
  }
  if (field.kind === "array") {
    return (state as any[]).map((x) => getValueFromState(field.element, x));
  }
  let obj: any = {};
  Object.keys(field.fields).forEach((key) => {
    obj[key] = getValueFromState(field.fields[key], state[key]);
  });
  return obj;
}

export function getFieldInstance(
  field: Field,
  state: any,
  setState: any,
  validationResult: any
) {
  if (field.kind === "scalar") {
    return getScalarFieldInstance(field, state, setState, validationResult);
  }
  if (field.kind === "array") {
    return getArrayFieldInstance(field, state, setState, validationResult);
  }
  return getObjectFieldInstance(field, state, setState, validationResult);
}
