import { ChangeEvent, useState } from "react";
import mapObj from "map-obj";

function runValidationFunction<Value, ValidationError, ValidatedValue = Value>(
  validationFn: ValidationFn<Value, ValidatedValue, ValidationError>,
  value: Value
): ValidationResult<Value, ValidatedValue, ValidationError> {
  let result = validationFn(value);
  if (result.validity === "valid") {
    return {
      validity: "valid",
      value: result.value,
      error: undefined,
    };
  }
  return {
    validity: "invalid" as const,
    value,
    error: result.error,
  };
}

export function useForm<FormField extends Field<any, any, any, any, any, any>>(
  field: FormField,
  initialValue?: InitialFieldValueInput<FormField>
): ReturnType<FormField["getField"]> {
  let [value, setValue] = useState(() => field.getInitialValue(initialValue));
  let [meta, setMeta] = useState(() => field.getInitialMeta(value));

  return field.getField({
    ...runValidationFunction(field.validate, value),
    setValue: (val) => {
      setValue(() => val);
    },
    meta,
    setMeta: (val) => {
      setMeta(() => val);
    },
  });
}

export const validation = {
  valid<ValidValue>(value: ValidValue) {
    return { validity: "valid" as const, value };
  },
  invalid<Error>(error: Error) {
    return { validity: "invalid" as const, error };
  },
};

export type BasicFieldInput<
  FieldValue,
  Meta,
  ValidatedValue,
  ValidationError
> = {
  setValue: (value: FieldValue) => void;
  meta: Meta;
  setMeta: (value: Meta) => void;
} & ValidationResult<FieldValue, ValidatedValue, ValidationError>;

export type Form<
  FormField extends Field<any, any, any, any, any, any>
> = FormField extends Field<any, any, infer Input, any, any, any>
  ? Input
  : never;

type ValidationFn<Value, ValidatedValue, ValidationError> = (
  value: Value
) =>
  | { validity: "valid"; value: ValidatedValue }
  | { validity: "invalid"; error: ValidationError };

export type FormValue<
  FormField extends Field<any, any, any, any, any, any>
> = ReturnType<FormField["getInitialValue"]>;

export type InitialFieldValueInput<
  FormField extends Field<any, any, any, any, any, any>
> = Parameters<FormField["getInitialValue"]>[0];

type ValidationResult<Value, ValidatedValue, ValidationError> =
  | { validity: "valid"; value: ValidatedValue; error: undefined }
  | { validity: "invalid"; value: Value; error: ValidationError };

type Field<
  Value,
  InitialFieldValueInputType,
  Input extends ValidationResult<Value, ValidatedValue, ValidationError>,
  Meta,
  ValidatedValue,
  ValidationError
> = {
  getInitialValue: (initialValueInput: InitialFieldValueInputType) => Value;
  getInitialMeta: (value: Value) => Meta;
  getField: (
    input: BasicFieldInput<Value, Meta, ValidatedValue, ValidationError>
  ) => Input;
  validate: ValidationFn<Value, ValidatedValue, ValidationError>;
};

type ObjectFieldBase = { [key: string]: Field<any, any, any, any, any, any> };

type ObjectFieldMapToField<
  ObjectFieldMap extends ObjectFieldBase,
  ValidatedValue,
  ValidationError
> = Field<
  {
    readonly [Key in keyof ObjectFieldMap]: FormValue<ObjectFieldMap[Key]>;
  },
  | {
      [Key in keyof ObjectFieldMap]?: InitialFieldValueInput<
        ObjectFieldMap[Key]
      >;
    }
  | undefined,
  {
    readonly props: {
      value: {
        readonly [Key in keyof ObjectFieldMap]: FormValue<ObjectFieldMap[Key]>;
      };
      onChange(
        value: {
          readonly [Key in keyof ObjectFieldMap]: FormValue<
            ObjectFieldMap[Key]
          >;
        }
      ): void;
    };
    readonly fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getField"]
      >;
    };
  } & ValidationResult<
    {
      readonly [Key in keyof ObjectFieldMap]: FormValue<ObjectFieldMap[Key]>;
    },
    ValidatedValue,
    ValidationError
  >,
  {},
  ValidatedValue,
  ValidationError
>;

export function makeField<
  Value,
  InitialFieldValueInputType,
  Input extends ValidationResult<Value, ValidatedValue, ValidationError>,
  Meta,
  ValidatedValue,
  ValidationError
>(
  field: Field<
    Value,
    InitialFieldValueInputType,
    Input,
    Meta,
    ValidatedValue,
    ValidationError
  >
): Field<
  Value,
  InitialFieldValueInputType,
  Input,
  Meta,
  ValidatedValue,
  ValidationError
> {
  return field;
}

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
      readonly onChange: (value: FormValue<InternalField>[]) => void;
    };
    readonly items: Form<InternalField>[];
  } & ValidationResult<
    FormValue<InternalField>[],
    ValidatedValue,
    ValidationError
  >,
  {},
  ValidatedValue,
  ValidationError
>;

export const field = {
  object<
    ObjectFieldMap extends ObjectFieldBase,
    ValidatedValue,
    ValidationError
  >(
    fields: ObjectFieldMap
  ): ObjectFieldMapToField<ObjectFieldMap, ValidatedValue, ValidationError> {
    return {
      getField(input) {
        return {
          ...input,
          props: input,
          fields: mapObj(fields, (sourceKey, sourceValue) => [
            // @ts-ignore
            sourceKey,
            sourceValue.getField({
              value: input.value[sourceKey],
              setValue: (val: any) => {
                input.setValue({ ...input.value, [sourceKey]: val });
              },
              meta: input.meta,
              setMeta: input.setMeta,
            }),
          ]),
        };
      },
      getInitialValue: (initialValue = {}) =>
        mapObj(fields, (sourceKey, sourceValue) => [
          // @ts-ignore
          sourceKey,
          sourceValue.getInitialValue(initialValue[sourceKey]),
        ]),
      getInitialMeta: () => ({}),
    };
  },
  date: <ValidatedValue, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<Date | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: { value: input.value, onChange: input.setValue },
        };
      },
      getInitialValue: (initialValueInput: Date | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({ touched: false }),
      validate,
    }),
  string: <ValidatedValue, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: { value: input.value, onChange: input.setValue },
        };
      },
      getInitialValue: (initialValueInput: string | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
  dateRange: <ValidatedValue, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<
      { from?: Date; to?: Date } | undefined,
      ValidatedValue,
      ValidationError
    >;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: { value: input.value, onChange: input.setValue },
        };
      },
      getInitialValue: (
        initialValueInput: { from?: Date; to?: Date } | undefined
      ) => initialValueInput || { from: undefined, to: undefined },
      getInitialMeta: () => {
        return {
          touched: false,
        };
      },
      validate,
    }),
  text: <ValidatedValue, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: {
            value: input.value,
            onChange(event: ChangeEvent<HTMLInputElement>) {
              input.setValue(event.target.value);
            },
          },
        };
      },
      getInitialValue: (initialValueInput: string | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({
        touched: false,
        validity: "invalid",
      }),
      validate,
    }),
  number: <ValidatedValue, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<number | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: {
            value: input.value,
            onChange(event: ChangeEvent<HTMLInputElement>) {
              let number = Number(event.target.value);
              input.setValue(isNaN(number) ? undefined : number);
            },
          },
        };
      },
      getInitialValue: (initialValueInput: number | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
  select: <ValidatedValue, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: {
            value: input.value,
            onChange(event: ChangeEvent<HTMLSelectElement>) {
              input.setValue(event.target.value);
            },
          },
        };
      },
      getInitialValue: (initialValueInput: string | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
  checkbox: <ValidatedValue, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<boolean, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: {
            checked: input.value,
            onChange(event: ChangeEvent<HTMLInputElement>) {
              input.setValue(event.target.checked);
            },
          },
        };
      },
      getInitialValue: (initialValueInput: boolean | undefined = false) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
  array: <
    InternalField extends Field<any, any, any, any, any, any>,
    ValidatedValue,
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
          props: { value: input.value, onChange: input.setValue },
          items: input.value.map((internalValue, index) => {
            return internalField.getField({
              value: internalValue,
              setValue(newInternalValue: FieldValue) {
                let newVal = [...input.value];
                newVal[index] = newInternalValue;
                input.setValue(newVal);
              },
              meta: input.meta,
              setMeta: input.setMeta,
            });
          }),
        };
      },
      getInitialValue: (initialValueInput = []) => {
        return initialValueInput.map((x) => internalField.getInitialValue(x));
      },
      getInitialMeta: (value) => ({
        itemsMeta: value.map((x) => internalField.getInitialMeta(x)),
      }),
      validate,
    };
  },
};
