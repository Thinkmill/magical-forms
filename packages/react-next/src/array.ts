import {
  getFieldValidity,
  ObjectField,
  ValidationFnInObjectValidation,
  ValidationObj,
} from "./object";
import { ScalarField } from "./scalar";
import { FormState, Field, FormValue, ValidatedFormValue, Form } from "./types";
import { getValueFromState, getFieldInstance } from "./utils";

export type ArrayFieldInstance<TArrayField extends ArrayField<any>> = (
  | {
      readonly validity: "valid";
      readonly value: ValidatedFormValue<TArrayField>;
    }
  | {
      readonly validity: "invalid";
      readonly value: FormValue<TArrayField>;
    }
) & {
  readonly setState: (elements: FormState<TArrayField>) => void;
  readonly state: FormState<TArrayField>;
  readonly elements: readonly Form<TArrayField["element"]>[];
  readonly _field: TArrayField;
};

export function getArrayFieldInstance(
  field: ArrayField<any>,
  state: readonly any[],
  setState: (state: (prevState: readonly any[]) => readonly any[]) => void,
  validationResult: any
): ArrayFieldInstance<any> {
  const elements = state.map((stateElement, i) => {
    return getFieldInstance(
      field.element,
      stateElement,
      (thing: any) => {
        setState((prevState) => {
          const newVal = [...prevState];
          newVal[i] = thing(newVal[i]);
          return newVal;
        });
      },
      validationResult[i]
    );
  });

  return {
    elements,
    state,
    setState: (elements) => {
      setState(() => elements as any);
    },
    validity: getFieldValidity(field, validationResult),
    value: getValueFromState(field, state),
    _field: field,
  };
}

type ArrayFieldValidation<
  Element extends Field,
  Value
> = Element extends ScalarField
  ? ValidationFnInObjectValidation<Element, Value>
  : Element extends ObjectField<any>
  ? ValidationObj<Element["fields"], Value>
  : never | undefined;

export type ArrayField<Element extends Field> = {
  readonly kind: "array";
  readonly element: Element;
  readonly validate:
    | ArrayFieldValidation<Element, readonly FormValue<Element>[]>
    | undefined;
  // this API is still def bad but meh
  readonly stateFromChange:
    | ((
        next: readonly FormState<Element>[],
        current: readonly FormState<Element>[] | undefined
      ) => readonly FormState<Element>[])
    | undefined;
};

export function array<Element extends Field>(
  element: Element,
  options?: {
    validate?: ArrayFieldValidation<Element, readonly FormValue<Element>[]>;
    stateFromChange?: (
      next: readonly FormState<Element>[],
      current?: readonly FormState<Element>[]
    ) => readonly FormState<Element>[];
  }
): ArrayField<Element> {
  return {
    kind: "array",
    element,
    validate: options?.validate,
    stateFromChange: options?.stateFromChange,
  };
}
