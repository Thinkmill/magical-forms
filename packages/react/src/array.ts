import {
  Field,
  FormValue,
  InitialFieldValueInput,
  Form,
  ValidationResult,
  ValidationFn,
  ValidatedFormValue,
  FormValidationError,
} from "./types";
import { runValidationFunction, validation } from "./validation";

type ArrayValidationFn<
  InnerValue,
  InnerValidatedValue extends InnerValue,
  InnerValidationError,
  ValidatedValue extends InnerValue[],
  ValidationError
> = (
  value:
    | { validity: "valid"; value: InnerValidatedValue[] }
    | { validity: "invalid"; error: InnerValidationError[] }
) =>
  | { validity: "valid"; value: ValidatedValue }
  | { validity: "invalid"; error: ValidationError };

type ArrayField<
  InternalField extends Field<any, any, any, any, any, any>,
  ValidatedValue extends FormValue<InternalField>[],
  ValidationError
> = Field<
  FormValue<InternalField>[],
  // TODO: think about this some more
  // I'm not sure if this is correct
  InitialFieldValueInput<InternalField>[] | undefined,
  {
    readonly props: {
      readonly value: FormValue<InternalField>[];
      readonly add: (value: FormValue<InternalField>) => void;
      readonly remove: (index: number) => void;
    };
    readonly items: Form<InternalField>[];
  } & ValidationResult<
    FormValue<InternalField>[],
    ValidatedValue,
    ValidationError
  >,
  {
    items: ReturnType<InternalField["getInitialMeta"]>[];
  },
  ValidatedValue,
  ValidationError
>;

type GetValidationErrorFromValidationFn<
  InnerValue,
  InnerValidatedValue extends InnerValue,
  InnerValidationError,
  ValidationOption
> = ValidationOption extends ArrayValidationFn<
  InnerValue,
  InnerValidatedValue,
  InnerValidationError,
  any,
  infer ValidationError
>
  ? ValidationError
  : never;

type GetValidatedValueFromValidationFn<
  InnerValue,
  InnerValidatedValue extends InnerValue,
  InnerValidationError,
  ValidationOption
> = ValidationOption extends ArrayValidationFn<
  InnerValue,
  InnerValidatedValue,
  InnerValidationError,
  infer ValidatedValue,
  any
>
  ? ValidatedValue
  : never;

type GetStuffFromForm<
  FormField extends Field<any, any, any, any, any, any>
> = FormField extends Field<infer Value, any, any, any, any, any>
  ? FormField extends Field<Value, any, any, any, infer ValidatedValue, any>
    ? { value: Value; validated: ValidatedValue }
    : never
  : never;

export const array = <
  InternalField extends Field<any, any, any, any, any, any>,
  ValidationFunction extends ArrayValidationFn<
    GetStuffFromForm<InternalField>["value"],
    GetStuffFromForm<InternalField>["validated"],
    FormValidationError<InternalField>,
    FormValue<InternalField>[],
    any
  >
>(
  internalField: InternalField,
  {
    validate,
  }: {
    validate: ValidationFunction;
  }
): ArrayField<
  InternalField,
  GetValidatedValueFromValidationFn<
    GetStuffFromForm<InternalField>["value"],
    GetStuffFromForm<InternalField>["validated"],
    FormValidationError<InternalField>,
    ValidationFunction
  >,
  GetValidatedValueFromValidationFn<
    GetStuffFromForm<InternalField>["value"],
    GetStuffFromForm<InternalField>["validated"],
    FormValidationError<InternalField>,
    ValidationFunction
  >
> => {
  return {
    getField(input) {
      return {
        ...input,
        props: {
          value: input.value,
          add(value) {
            input.setValue(input.value.concat([value]));
          },
          remove(index) {
            let val = [...input.value];
            val.splice(index, 1);
            input.setValue(val);
          },
        },
        items: input.value.map((internalValue, index) => {
          return internalField.getField({
            ...runValidationFunction(internalField.validate, internalValue),
            setValue(newInternalValue) {
              let newVal = [...input.value];
              newVal[index] = newInternalValue;
              input.setValue(newVal);
            },
            meta: input.meta.items[index],
            setMeta: input.setMeta,
          });
        }),
      };
    },
    getInitialValue: (initialValueInput = []) => {
      return initialValueInput.map((x) => internalField.getInitialValue(x));
    },
    getInitialMeta: (value) => ({
      items: value.map((x) => internalField.getInitialMeta(x)),
    }),
    validate: (value) => {
      let innerResult = value.map((val) =>
        runValidationFunction(internalField.validate, val)
      );
      let areAllFieldsValid = innerResult.every(
        (value) => value.validity === "valid"
      );
      let errors = innerResult.map((val) => val.error);
      if (validate === undefined) {
        return areAllFieldsValid
          ? validation.valid(value)
          : validation.invalid(errors);
      }
      return validate({
        validity: areAllFieldsValid ? "valid" : "invalid",
        value,
        // @ts-ignore
        error: areAllFieldsValid ? undefined : errors,
      });
    },
  };
};
