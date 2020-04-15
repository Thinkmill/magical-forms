import {
  Field,
  FormValue,
  InitialFieldValueInput,
  Form,
  ValidationResult,
  ValidationFunctionToValidatedValue,
} from "@magical-forms/types";
import { runValidationFunction, validation } from "@magical-forms/validation";
import {
  CompositeTypes,
  OptionsBase,
  ValidatedValueFromOptions,
  ValidationErrorFromOptions,
} from "./types";

type ArrayFieldBase = Field<any, any, any, any, any, any>;

type ArrayValue<InternalField extends ArrayFieldBase> = FormValue<
  InternalField
>[];

type ArrayValidatedInternalValue<
  InternalField extends ArrayFieldBase
> = ValidationFunctionToValidatedValue<
  ArrayValue<InternalField>,
  InternalField["validate"]
>[];

type ArrayValidationResults<InternalField extends ArrayFieldBase> = ReturnType<
  InternalField["validate"]
>[];

type ArrayCompositeTypes<InternalField extends ArrayFieldBase> = CompositeTypes<
  ArrayValue<InternalField>,
  ArrayValidatedInternalValue<InternalField>,
  ArrayValidationResults<InternalField>
>;

type ArrayField<
  InternalField extends ArrayFieldBase,
  ValidatedValue extends FormValue<InternalField>[],
  ValidationError
> = Field<
  ArrayValue<InternalField>,
  // TODO: think about this some more
  // I'm not sure if this is correct
  InitialFieldValueInput<InternalField>[] | undefined,
  {
    readonly props: {
      readonly value: ArrayValue<InternalField>;
      readonly add: (value: FormValue<InternalField>) => void;
      readonly remove: (index: number) => void;
    };
    readonly items: Form<InternalField>[];
  } & ValidationResult<
    ArrayValue<InternalField>,
    ValidatedValue,
    ValidationError
  >,
  {
    items: ReturnType<InternalField["getInitialMeta"]>[];
  },
  ValidatedValue,
  ValidationError
>;

export const array = <
  InternalField extends ArrayFieldBase,
  Options extends OptionsBase<ArrayCompositeTypes<ArrayFieldBase>>
>(
  internalField: InternalField,
  options?: Options
): ArrayField<
  InternalField,
  ValidatedValueFromOptions<ArrayCompositeTypes<InternalField>, Options>,
  ValidationErrorFromOptions<ArrayCompositeTypes<InternalField>, Options>
> => {
  return {
    getField(input) {
      return {
        ...input,
        props: {
          value: input.value,
          add(value) {
            input.setValue(
              (input.value as ArrayValue<InternalField>).concat([value])
            );
          },
          remove(index) {
            let val = [...(input.value as ArrayValue<InternalField>)];
            val.splice(index, 1);
            input.setValue(val);
          },
        },
        items: (input.value as ArrayValue<InternalField>).map(
          (internalValue, index) => {
            return internalField.getField({
              ...runValidationFunction(internalField.validate, internalValue),
              setValue(newInternalValue) {
                let newVal = [...(input.value as ArrayValue<InternalField>)];
                newVal[index] = newInternalValue;
                input.setValue(newVal);
              },
              meta: input.meta.items[index],
              setMeta: input.setMeta,
            });
          }
        ),
      };
    },
    getInitialValue: (initialValueInput = []) => {
      return initialValueInput.map((x) => internalField.getInitialValue(x));
    },
    getInitialMeta: (value) => ({
      items: value.map((x) => internalField.getInitialMeta(x)),
    }),
    validate: (value) => {
      let innerResult = value.map((value) =>
        runValidationFunction(internalField.validate, value)
      );
      let areAllFieldsValid = innerResult.every(
        (value) => value.validity === "valid"
      );
      if (options === undefined || options.validate === undefined) {
        return areAllFieldsValid
          ? validation.valid(value)
          : validation.invalid(innerResult);
      }
      return options.validate(
        // @ts-ignore
        areAllFieldsValid
          ? {
              validity: "valid" as const,
              value,
            }
          : {
              validity: "invalid",
              value,
              error: innerResult,
            }
      );
    },
  };
};
