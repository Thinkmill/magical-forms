import { Form, InitialValueInput, Field, FormState } from "./types";
import {
  ScalarValidationFn,
  ScalarValidationResult,
  ScalarField,
} from "./scalar";
import { useState } from "react";
import { mapObject } from "./map-obj";
import { ObjectField } from "./object";
import { getFieldInstance, getValueFromState } from "./utils";
export type { ValidationFnInObjectValidation } from "./object";
export { object } from "./object";
export { scalar } from "./scalar";
export type { ScalarField, ValidatedFormValueFromScalarField } from "./scalar";

export * from "./types";

export const validation = {
  valid<ValidValue>(value: ValidValue) {
    return { validity: "valid", value } as const;
  },
  invalid(error: string) {
    return { validity: "invalid", error } as const;
  },
};

function runValidationFunction<Value, ValidatedValue extends Value>(
  validationFn: ScalarValidationFn<Value, ValidatedValue>,
  value: Value
): ScalarValidationResult<Value, ValidatedValue> {
  let result = validationFn(value);
  if (result.validity === "valid") {
    return {
      validity: "valid",
      value: result.value,
      error: undefined,
    };
  }
  return {
    validity: "invalid",
    value,
    error: result.error,
  };
}

function getInitialValue(field: Field, initialValue: any): any {
  if (field.kind === "object") {
    if (initialValue === undefined) {
      initialValue = {};
    }
    return mapObject(field.fields, (key, value) => {
      return getInitialValue(value, initialValue[key]);
    });
  }
  return {
    touched: false,
    value: field.initialValue(initialValue),
  };
}

function getNewState(field: Field, newState: any, prevState: any) {
  if (field.kind === "scalar") {
    if (field.stateFromChange) {
      newState = field.stateFromChange(prevState, newState);
    }
    return newState;
  }
  let newObjState: any = {};
  // we don't want to have a new reference if we don't need to
  // TODO: maybe optimise the calling of getNewState
  let hasAFieldDifferent = false;
  mapObject(field.fields, (key, field) => {
    let result = getNewState(field, newState[key], prevState[key]);
    hasAFieldDifferent = hasAFieldDifferent || result !== prevState[key];
    newObjState[key] = result;
  });
  if (field.stateFromChange) {
    let storedNewObjState = newObjState;
    newObjState = field.stateFromChange(newObjState, prevState);
    hasAFieldDifferent =
      hasAFieldDifferent || newObjState !== storedNewObjState;
  }
  if (hasAFieldDifferent) {
    return newObjState;
  }
  return prevState;
}

function getValidationResultFromScalarField(
  field: ScalarField,
  value: any,
  parentValidator: ScalarValidationFn<any, any>
) {
  return runValidationFunction((value) => {
    let validationResult = field.validate(value);
    if (validationResult.validity === "valid") {
      return parentValidator(value);
    }
    return validationResult;
  }, value);
}

function makeDefaultValidationObject(fields: any) {
  let validationObject: Record<string, any> = {};
  Object.keys(fields).forEach((key) => {
    if (fields[key].kind === "object") {
      validationObject[key] = makeDefaultValidationObject(fields[key].fields);
    } else {
      validationObject[key] = [];
    }
  });
  return validationObject;
}

function getValidationResults(field: Field, state: any) {
  if (field.kind === "scalar") {
    return getValidationResultFromScalarField(field, state.value, (value) =>
      validation.valid(value)
    );
  }
  let validationObj = makeDefaultValidationObject(field.fields);
  recursivelyAddValidators(
    validationObj,
    field,
    getValueFromState(field, state)
  );
  return executeValidation(field, validationObj, state);
}

function executeValidation(field: Field, validator: any, state: any) {
  if (field.kind === "object") {
    let result: any = {};
    Object.keys(field.fields).forEach((key) => {
      result[key] = executeValidation(
        field.fields[key],
        validator[key],
        state[key]
      );
    });
    return result;
  }
  return getValidationResultFromScalarField(
    field,
    state.value,
    validator.reduce(
      (validateThing: any, item: any) => {
        return (value: any) => {
          let inner = validateThing(value);
          if (inner.validity === "invalid") {
            return inner;
          }
          return item(value);
        };
      },
      (value: any) => validation.valid(value)
    )
  );
}

function recursivelyAddValidators(
  validationObj: any,
  field: ObjectField<any>,
  value: any
) {
  Object.keys(field.fields).forEach((key) => {
    if (field.fields[key].kind === "object") {
      recursivelyAddValidators(
        validationObj[key],
        field.fields[key],
        value[key]
      );
    }
  });
  addValidators(validationObj, field.validate, value);
}

function addValidators(
  validationObject: any,
  validationObjInput: ObjectField<any>["validate"] | undefined,
  value: any
) {
  if (validationObjInput) {
    Object.keys(validationObjInput).forEach((key) => {
      const validationFuncOrObject = validationObjInput[key];

      if (typeof validationFuncOrObject === "function") {
        validationObject[key].push((val: any) => {
          return validationFuncOrObject(val, value);
        });
      }
      // @ts-ignore
      addValidators(validationObject[key], validationFuncOrObject, value);
    });
  }
}

export const useForm: <TField extends Field>(
  ...args: undefined extends InitialValueInput<TField>
    ? [TField] | [TField, InitialValueInput<TField>]
    : [TField, InitialValueInput<TField>]
) => Form<TField> = function <TField extends Field>(
  rootField: TField,
  initialValue: InitialValueInput<TField>
) {
  let [state, _setState] = useState<FormState<TField>>(() =>
    getInitialValue(rootField, initialValue)
  );

  let setState = (
    newStateDescription: (prevState: FormState<TField>) => FormState<TField>
  ) => {
    _setState((prevState) => {
      let newState = newStateDescription(prevState);
      return getNewState(rootField, newState, prevState);
    });
  };

  return getFieldInstance(
    rootField,
    state,
    setState,
    getValidationResults(rootField, state)
  );
} as any;
