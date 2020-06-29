import { Field } from "./types";
import { getScalarFieldInstance } from "./scalar";
import { getObjectFieldInstance } from "./object";

export function getValueFromState(field: Field, state: any) {
  if (field.kind === "scalar") {
    return state.value;
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
  return getObjectFieldInstance(field, state, setState, validationResult);
}
