import { useState } from "react";
import mapObj from "map-obj";

const FIELD_TYPE = "____FORM_FIELD____";

export function useForm<FormField extends Field<any, any>>(
  field: FormField
): [
  ReturnType<FormField["getField"]>,
  FormField["defaultValue"],
  (val: FormField["defaultValue"]) => void
] {
  let [state, setState] = useState(() => field.defaultValue);
  return [
    field.getField({
      value: state,
      onChange: val => {
        setState(() => val);
      }
    }),
    state,
    val => {
      setState(() => val);
    }
  ];
}

type BasicFieldInput<FieldValue> = {
  value: FieldValue;
  onChange: (value: FieldValue) => void;
};

type Field<FieldValue, Input> = {
  $$typeof: typeof FIELD_TYPE;
  defaultValue: FieldValue;
  getField: (input: BasicFieldInput<FieldValue>) => Input;
};

type ObjectFieldBase = { [key: string]: Field<any, any> };

type ObjectFieldMapToField<ObjectFieldMap extends ObjectFieldBase> = Field<
  {
    [Key in keyof ObjectFieldMap]: ObjectFieldMap[Key]["defaultValue"];
  },
  {
    [Key in keyof ObjectFieldMap]: ReturnType<ObjectFieldMap[Key]["getField"]>;
  }
>;

function makeBasicField<FieldValue, Input>(
  getField: (input: BasicFieldInput<FieldValue>) => Input
) {
  return (defaultValue: FieldValue): Field<FieldValue, Input> => ({
    $$typeof: FIELD_TYPE,
    getField,
    defaultValue
  });
}

type ArrayField<FieldValue, FieldInput> = Field<
  FieldValue[],
  {
    props: BasicFieldInput<FieldValue[]>;
    items: FieldInput[];
  }
>;

export const field = {
  object<ObjectFieldMap extends ObjectFieldBase>(
    fields: ObjectFieldMap
  ): ObjectFieldMapToField<ObjectFieldMap> {
    return {
      $$typeof: FIELD_TYPE,
      getField({ value, onChange }) {
        // @ts-ignore
        return mapObj(fields, (sourceKey, sourceValue) => [
          // @ts-ignore
          sourceKey,
          sourceValue.getField({
            value: value[sourceKey],
            onChange: (val: any) => {
              onChange({ ...value, [sourceKey]: val });
            }
          })
        ]);
      },
      defaultValue: mapObj(fields, (sourceKey, sourceValue) => [
        // @ts-ignore
        sourceKey,
        sourceValue.defaultValue
      ])
    };
  },
  string: makeBasicField((input: BasicFieldInput<string>) => ({
    props: input
  })),
  array: <FieldValue, FieldInput>(
    internalField: Field<FieldValue, FieldInput>
  ): ArrayField<FieldValue, FieldInput> => {
    return {
      $$typeof: FIELD_TYPE,
      getField(input) {
        return {
          props: { value: input.value, onChange: input.onChange },
          items: input.value.map((internalValue, index) => {
            return internalField.getField({
              value: internalValue,
              onChange(newInternalValue: FieldValue) {
                let newVal = [...input.value];
                newVal[index] = newInternalValue;
                input.onChange(newVal);
              }
            });
          })
        };
      },
      defaultValue: []
    };
  }
};
