import type {
  Field,
  FormValue,
  InitialFieldValueInput,
  Form,
  ValidationResult,
  ValidationFn,
} from "./types";
import { runValidationFunction } from "./validation";

type ArrayField<
  InternalField extends Field<any, any, any, any, any, any>,
  ValidatedValue,
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

export const array = <
  InternalField extends Field<any, any, any, any, any, any>,
  ValidatedValue extends FormValue<InternalField>[],
  ValidationError
>(
  internalField: InternalField,
  {
    validate,
  }: {
    validate: ValidationFn<
      FormValue<InternalField>[],
      ValidatedValue,
      ValidationError
    >;
  }
): ArrayField<InternalField, ValidatedValue, ValidationError> => {
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
    validate,
  };
};
