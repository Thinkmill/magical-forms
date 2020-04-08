import { mapObject } from "./map-obj";

import {
  Field,
  FormValue,
  InitialFieldValueInput,
  ValidationResult,
  ValidatedFormValue,
  FormValidationError,
  ValidationFn,
} from "./types";
import { runValidationFunction, validation } from "./validation";

export type ObjectValidationFn<PrevResult, ValidatedValue, ValidationError> = (
  value: PrevResult
) =>
  | { validity: "valid"; value: ValidatedValue }
  | { validity: "invalid"; error: ValidationError };

type ObjectFieldBase = { [key: string]: Field<any, any, any, any, any, any> };

type ObjectFieldMapToField<
  ObjectFieldMap extends ObjectFieldBase,
  ValidationFunction extends ObjectValidationFnBase<ObjectFieldMap>
> = Field<
  {
    readonly [Key in keyof ObjectFieldMap]: ReturnType<
      ObjectFieldMap[Key]["getInitialValue"]
    >;
  },
  | {
      [Key in keyof ObjectFieldMap]?: InitialFieldValueInput<
        ObjectFieldMap[Key]
      >;
    }
  | undefined,
  {
    readonly props: {
      value: ObjectValueFromFieldMap<ObjectFieldMap>;
      onChange(value: ObjectValueFromFieldMap<ObjectFieldMap>): void;
    };
    readonly fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getField"]
      >;
    };
  } & ValidationResult<
    ObjectValueFromFieldMap<ObjectFieldMap>,
    GetValidatedValueFromValidationFn<ValidationFunction>,
    GetValidationErrorFromValidationFn<ValidationFunction>
  >,
  {
    fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getInitialMeta"]
      >;
    };
  },
  GetValidatedValueFromValidationFn<ValidationFunction>,
  GetValidationErrorFromValidationFn<ValidationFunction>
>;

type GetValidationErrorFromValidationFn<
  ValidationOption
> = ValidationOption extends ObjectValidationFn<any, any, infer ValidationError>
  ? ValidationError
  : never;

type GetValidatedValueFromValidationFn<
  ValidationOption
> = ValidationOption extends ObjectValidationFn<any, infer ValidatedValue, any>
  ? ValidatedValue
  : never;

type ObjectValueFromFieldMap<ObjectFieldMap extends ObjectFieldBase> = {
  readonly [Key in keyof ObjectFieldMap]: ReturnType<
    ObjectFieldMap[Key]["getInitialValue"]
  >;
};

type ObjectValidationFnBase<
  ObjectFieldMap extends ObjectFieldBase
> = ObjectValidationFn<
  ValidationResult<
    ObjectValueFromFieldMap<ObjectFieldMap>,
    {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getInitialValue"]
      >; //ReturnType<
      //   ObjectFieldMap[Key]["validate"]
      // > extends {
      //   validity: "valid";
      //   value: infer ValidatedValue;
      // }
      //   ? ValidatedValue
      //   : never;
      //   ValidatedFormValue<
      //   ObjectFieldMap[Key]
      // >;
    },
    {
      readonly [Key in keyof ObjectFieldMap]: FormValidationError<
        ObjectFieldMap[Key]
      >;
    }
  >,
  {
    readonly [Key in keyof ObjectFieldMap]: ReturnType<
      ObjectFieldMap[Key]["getInitialValue"]
    >;
  },
  any
>;

type ValidateOptionBase<ObjectFieldMap extends ObjectFieldBase> =
  | ObjectValidationFnBase<ObjectFieldMap>
  | undefined;

type Identity = <T>(t: T) => T;

// ? ObjectValidationFn<
//     ValidationResult<
//       ObjectValueFromFieldMap<ObjectFieldMap>,
//       {
//         readonly [Key in keyof ObjectFieldMap]: ValidatedFormValue<
//           ObjectFieldMap[Key]
//         >;
//       },
//       {
//         readonly [Key in keyof ObjectFieldMap]: FormValidationError<
//           ObjectFieldMap[Key]
//         >;
//       }
//     >,
//     {
//       readonly [Key in keyof ObjectFieldMap]: ReturnType<
//         ObjectFieldMap[Key]["getInitialValue"]
//       >;
//     },
//     any
//   >

export function object<
  ObjectFieldMap extends ObjectFieldBase,
  ValidationFunction extends ValidateOptionBase<ObjectFieldMap>
>(
  fields: ObjectFieldMap,
  {
    validate,
  }: {
    validate?: ValidationFunction;
  } = {}
): ObjectFieldMapToField<
  ObjectFieldMap,
  ValidationFunction extends undefined ? Identity : ValidationFunction
> {
  return {
    getField(input) {
      return {
        ...input,
        props: {
          value: input.value as ObjectValueFromFieldMap<ObjectFieldMap>,
          onChange: input.setValue,
        },
        fields: mapObject(fields, (sourceKey, sourceValue) =>
          sourceValue.getField({
            ...runValidationFunction(
              sourceValue.validate,
              // @ts-ignore
              input.value[sourceKey]
            ),
            setValue: (val: any) => {
              input.setValue({
                // @ts-ignore
                ...input.value,
                [sourceKey]: val,
              });
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
      let innerResult = mapObject(fields, (sourceKey, sourceValue) =>
        runValidationFunction(sourceValue.validate, value[sourceKey])
      );
      let areAllFieldsValid = Object.values(innerResult).every(
        (value) => value.validity === "valid"
      );
      let errors = mapObject(
        innerResult,
        (_sourceKey, sourceValue) => sourceValue.error
      );
      if (validate === undefined) {
        return areAllFieldsValid
          ? validation.valid(value)
          : validation.invalid(errors);
      }
      return validate(
        // @ts-ignore
        {
          validity: areAllFieldsValid ? "valid" : "invalid",
          value,
          error: areAllFieldsValid ? undefined : errors,
        }
      );
    },
  };
}
