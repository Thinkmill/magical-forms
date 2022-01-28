import { Form, InitialValueInput, Field, FormState, FormValue } from "./types";
import { ScalarValidationFn, ScalarValidationResult } from "./scalar";
import { useState } from "react";
import { mapObject } from "./map-obj";
import { getFieldInstance, getValueFromState } from "./utils";
export * from "./object";
export * from "./array";
export * from "./scalar";

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

export function getInitialState<TField extends Field>(
  rootField: TField,
  ...initialValue: AllowEmptyIfUndefined<InitialValueInput<TField>>
): FormState<TField> {
  // @ts-ignore
  return getInitialValueFromField(rootField, initialValue[0]);
}

function getInitialValueFromField(field: Field, initialValue: any): any {
  if (field.kind === "object") {
    if (initialValue === undefined) {
      initialValue = {};
    }
    return mapObject(field.fields, (key, value) => {
      return getInitialValueFromField(value, initialValue[key]);
    });
  }
  if (field.kind === "array") {
    if (initialValue === undefined) {
      initialValue = [];
    }
    return (initialValue as any[]).map((element) => {
      return getInitialValueFromField(field.element, element);
    });
  }
  return {
    touched: false,
    value: field.initialValue(initialValue),
  };
}

function getNewState(
  field: Field,
  newState: any,
  prevState: undefined | Record<string | number | symbol, any>
): any {
  if (field.kind === "scalar") {
    if (field.stateFromChange) {
      newState = field.stateFromChange(newState, prevState as any);
    }
    return newState;
  }
  if (field.kind === "array") {
    let hasAElementDifferent = newState.length !== prevState?.length;
    let newArrayState = (newState as any[]).map((newStateElement, i) => {
      let result = getNewState(field.element, newStateElement, prevState?.[i]);
      hasAElementDifferent = hasAElementDifferent || result !== prevState?.[i];
      return result;
    });
    if (field.stateFromChange) {
      let storedNewArrayState = newArrayState;
      newArrayState = field.stateFromChange(
        newArrayState,
        prevState as any
      ) as any;
      hasAElementDifferent =
        hasAElementDifferent || newArrayState !== storedNewArrayState;
    }
    if (hasAElementDifferent) {
      return newArrayState;
    }
    return prevState;
  }
  let newObjState: any = {};
  // we don't want to have a new reference if we don't need to
  // TODO: maybe optimise the calling of getNewState
  let hasAFieldDifferent = false;
  mapObject(field.fields, (key, field) => {
    let result = getNewState(field, newState[key], prevState?.[key]);
    hasAFieldDifferent = hasAFieldDifferent || result !== prevState?.[key];
    newObjState[key] = result;
  });
  if (field.stateFromChange) {
    let storedNewObjState = newObjState;
    newObjState = field.stateFromChange(newObjState, prevState as any);
    hasAFieldDifferent =
      hasAFieldDifferent || newObjState !== storedNewObjState;
  }
  if (hasAFieldDifferent) {
    return newObjState;
  }
  return prevState;
}

type ObjectValidator = { [key: string]: Validator };

type Validator = ObjectValidator | Validator[] | ScalarValidationFn<any, any>;

function makeBaseValidator<TField extends Field>(
  field: TField,
  value: any
): Validator {
  if (field.kind === "scalar") {
    return field.validate;
  }
  if (field.kind === "array") {
    return (value as any[]).map((val) => makeBaseValidator(field.element, val));
  }
  let validationObject: Record<string, any> = {};
  Object.keys(field.fields).forEach((key) => {
    validationObject[key] = makeBaseValidator(field.fields[key], value[key]);
  });
  return validationObject;
}

function getValidationResults(field: Field, state: any) {
  const value = getValueFromState(field, state);
  let validator = makeBaseValidator(field, value);
  validator = recursivelyAddValidators(validator, field, value);
  return executeValidation(field, validator, state);
}

function executeValidation(
  field: Field,
  validator: Validator,
  state: any
): any {
  if (field.kind === "object") {
    let result: any = {};
    Object.keys(field.fields).forEach((key) => {
      result[key] = executeValidation(
        field.fields[key],
        (validator as ObjectValidator)[key],
        state[key]
      );
    });
    return result;
  }
  if (field.kind === "array") {
    return (state as any[]).map((stateElement, i) => {
      return executeValidation(
        field.element,
        (validator as Validator[])[i],
        stateElement
      );
    });
  }

  return runValidationFunction((value) => {
    return (validator as any)(value);
  }, state.value);
}

function recursivelyAddValidators(
  validator: Validator,
  field: Field,
  value: any
): Validator {
  if (field.kind === "array") {
    validator = (validator as Validator[]).map((innerValidator, i) =>
      recursivelyAddValidators(innerValidator, field.element, value[i])
    );
  }
  if (field.kind === "object") {
    Object.keys(field.fields).forEach((key) => {
      (validator as ObjectValidator)[key] = recursivelyAddValidators(
        (validator as ObjectValidator)[key],
        field.fields[key],
        value[key]
      );
    });
  }
  if (field.kind === "scalar") {
    return validator;
  }
  return addValidators(validator, field.validate as any, value);
}

function addValidators(
  inputValidator: Validator,
  validatorToAdd: any,
  value: any
): Validator {
  if (typeof inputValidator === "function") {
    return (val: any) => {
      const inner = inputValidator(val);
      if (inner.validity === "invalid") {
        return inner;
      }
      return value === undefined
        ? validatorToAdd(val)
        : validatorToAdd(val, value);
    };
  }
  if (Array.isArray(inputValidator)) {
    return (inputValidator as Validator[]).map((inputValidator) => {
      return addValidators(inputValidator, validatorToAdd, value);
    });
  }
  if (
    typeof inputValidator === "object" &&
    typeof validatorToAdd === "object"
  ) {
    Object.keys(validatorToAdd).forEach((key) => {
      const innerInputValidator = inputValidator[key];
      const innerValidatorToAdd = validatorToAdd[key];
      inputValidator[key] = addValidators(
        innerInputValidator,
        innerValidatorToAdd,
        value
      );
    });
  }
  return inputValidator;
}

export const resetForm: <TField extends Field>(
  ...args: undefined extends InitialValueInput<TField>
    ? [Form<TField>] | [Form<TField>, InitialValueInput<TField>]
    : [Form<TField>, InitialValueInput<TField>]
) => void = function (form: Form<Field>, initialValue: any) {
  (form.setState as any)(getInitialValueFromField(form._field, initialValue));
} as any;

type AllowEmptyIfUndefined<T> = (undefined extends T ? [] : never) | [T];

export const useForm: <TField extends Field>(
  rootField: TField,
  ...initialValue: AllowEmptyIfUndefined<InitialValueInput<TField>>
) => Form<TField> = function (
  rootField: Field,
  initialValue: InitialValueInput<Field>
) {
  let [state, _setState] = useState<FormState<Field>>(() =>
    getInitialValueFromField(rootField, initialValue)
  );

  let setState = (
    newStateDescription: (prevState: FormState<Field>) => FormState<Field>
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
