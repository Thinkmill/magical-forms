import { ChangeEvent, useState } from "react";
import mapObj from "map-obj";

export function useForm<FormField extends Field<any, any, any, any>>(
  field: FormField,
  initialValue?: InitialFieldValueInput<FormField>
): ReturnType<FormField["getField"]> {
  let [value, setValue] = useState(() => field.getInitialValue(initialValue));
  let [meta, setMeta] = useState(() => field.getInitialMeta(value));

  return field.getField({
    value,
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

export type BasicFieldInput<FieldValue, Meta> = {
  value: FieldValue;
  setValue: (value: FieldValue) => void;
  meta: Meta;
  setMeta: (value: Meta) => void;
};

export type Form<
  FormField extends Field<any, any, any, any>
> = FormField extends Field<any, any, infer Input, any> ? Input : never;

export type FormValue<FormField extends Field<any, any, any, any>> = ReturnType<
  FormField["getInitialValue"]
>;

export type InitialFieldValueInput<
  FormField extends Field<any, any, any, any>
> = Parameters<FormField["getInitialValue"]>[0];

type Field<Value, InitialFieldValueInputType, Input, Meta> = {
  getInitialValue: (initialValueInput: InitialFieldValueInputType) => Value;
  getInitialMeta: (value: Value) => Meta;
  getField: (input: BasicFieldInput<Value, Meta>) => Input;
};

type ObjectFieldBase = { [key: string]: Field<any, any, any, any> };

type ObjectFieldMapToField<ObjectFieldMap extends ObjectFieldBase> = Field<
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
    readonly props: BasicFieldInput<
      {
        readonly [Key in keyof ObjectFieldMap]: FormValue<ObjectFieldMap[Key]>;
      },
      {}
    >;
    readonly fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getField"]
      >;
    };
  },
  {}
>;

export function makeField<FormField>(field: FormField): FormField {
  return field;
}

type ArrayField<FieldValue, InitialFieldValueInputType, FieldInput> = Field<
  FieldValue[],
  // TODO: think about this some more
  // I'm not sure if this is correct
  InitialFieldValueInputType[] | undefined,
  {
    readonly props: {
      readonly value: FieldValue[];
      readonly onChange: (value: FieldValue[]) => void;
    };
    readonly items: FieldInput[];
  },
  {}
>;

export const field = {
  object<ObjectFieldMap extends ObjectFieldBase>(
    fields: ObjectFieldMap
  ): ObjectFieldMapToField<ObjectFieldMap> {
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
  date: makeField({
    getField: (input: BasicFieldInput<Date | undefined, {}>) => ({
      ...input,
      props: { value: input.value, onChange: input.setValue },
    }),
    getInitialValue: (initialValueInput: Date | undefined) => initialValueInput,
    getInitialMeta: () => ({}),
  }),
  string: makeField({
    getField: (input: BasicFieldInput<string, {}>) => ({
      ...input,
      props: { value: input.value, onChange: input.setValue },
    }),
    getInitialValue: (initialValueInput: string | undefined = "") =>
      initialValueInput,
    getInitialMeta: () => ({}),
  }),
  dateRange: makeField({
    getField: (input: BasicFieldInput<{ from?: Date; to?: Date }, {}>) => ({
      ...input,
      props: { value: input.value, onChange: input.setValue },
    }),
    getInitialValue: (
      initialValueInput: { from?: Date; to?: Date } | undefined
    ) => initialValueInput || { from: undefined, to: undefined },
    getInitialMeta: () => {
      return {
        touched: false,
        validity: "invalid",
        __mutable: {},
      };
    },
  }),
  text: makeField({
    getField: (input: BasicFieldInput<string | undefined, {}>) => ({
      ...input,
      props: {
        value: input.value,
        onChange(event: ChangeEvent<HTMLInputElement>) {
          input.setValue(event.target.value);
        },
      },
    }),
    getInitialValue: (initialValueInput: string | undefined) =>
      initialValueInput,
    getInitialMeta: () => ({
      touched: false,
      validity: "invalid",
    }),
  }),
  number: makeField({
    getField: (input: BasicFieldInput<number | undefined, {}>) => ({
      ...input,
      props: {
        value: input.value,
        onChange(event: ChangeEvent<HTMLInputElement>) {
          let number = Number(event.target.value);
          input.setValue(isNaN(number) ? undefined : number);
        },
      },
    }),
    getInitialValue: (initialValueInput: number | undefined) =>
      initialValueInput,
    getInitialMeta: () => ({}),
  }),
  select: makeField({
    getField: (input: BasicFieldInput<string | undefined, {}>) => ({
      ...input,
      props: {
        value: input.value,
        onChange(event: ChangeEvent<HTMLSelectElement>) {
          input.setValue(event.target.value);
        },
      },
    }),
    getInitialValue: (initialValueInput: string | undefined) =>
      initialValueInput,
    getInitialMeta: () => ({}),
  }),
  checkbox: makeField({
    getField: (input: BasicFieldInput<boolean, {}>) => ({
      ...input,
      props: {
        checked: input.value,
        onChange(event: ChangeEvent<HTMLInputElement>) {
          input.setValue(event.target.checked);
        },
      },
    }),
    getInitialValue: (initialValueInput: boolean | undefined = false) =>
      initialValueInput,
    getInitialMeta: () => ({}),
  }),
  array: <FieldValue, InitialFieldValueInputType, FieldInput>(
    internalField: Field<FieldValue, InitialFieldValueInputType, FieldInput, {}>
  ): ArrayField<FieldValue, InitialFieldValueInputType, FieldInput> => {
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
      getInitialMeta: () => ({}),
    };
  },
};
