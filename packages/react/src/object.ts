import { mapObject } from "./map-obj";

import {
  Field,
  FormValue,
  InitialFieldValueInput,
  ValidationResult,
  ValidatedFormValue,
  FormValidationError,
} from "./types";
import { runValidationFunction } from "./validation";

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
  {
    fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getInitialMeta"]
      >;
    };
  },
  ValidatedValue,
  ValidationError
>;

export function object<
  ObjectFieldMap extends ObjectFieldBase,
  ValidatedValue extends {
    readonly [Key in keyof ObjectFieldMap]: ReturnType<
      ObjectFieldMap[Key]["getInitialValue"]
    >;
  },
  ValidationError
>(
  fields: ObjectFieldMap,
  {
    validate,
  }: {
    validate: (
      result: {
        readonly [Key in keyof ObjectFieldMap]: ValidationResult<
          FormValue<ObjectFieldMap[Key]>,
          ValidatedFormValue<ObjectFieldMap[Key]>,
          FormValidationError<ObjectFieldMap[Key]>
        >;
      }
    ) =>
      | { validity: "invalid"; error: ValidationError }
      | { validity: "valid"; value: ValidatedValue };
  }
): ObjectFieldMapToField<ObjectFieldMap, ValidatedValue, ValidationError> {
  return {
    getField(input) {
      return {
        ...input,
        props: { value: input.value, onChange: input.setValue },
        fields: mapObject(fields, (sourceKey, sourceValue) =>
          sourceValue.getField({
            ...runValidationFunction(
              sourceValue.validate,
              input.value[sourceKey]
            ),
            setValue: (val: any) => {
              input.setValue({ ...input.value, [sourceKey]: val });
            },
            meta: input.meta.fields[sourceKey],
            setMeta: (val: any) => {
              input.setMeta({
                fields: { ...input.meta.fields, [sourceKey]: val },
              });
            },
          })
        ),
      };
    },
    getInitialValue: (initialValue = {}) =>
      mapObject(fields, (sourceKey, sourceValue) =>
        sourceValue.getInitialValue(initialValue[sourceKey])
      ),
    getInitialMeta: (value) => ({
      fields: mapObject(fields, (sourceKey, sourceValue) =>
        sourceValue.getInitialValue(value[sourceKey])
      ),
    }),
    validate: (value) => {
      return validate(
        mapObject(fields, (sourceKey, sourceValue) =>
          runValidationFunction(sourceValue.validate, value[sourceKey])
        )
      );
    },
  };
}
