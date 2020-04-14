import { mapObject } from "./map-obj";

import {
  Field,
  InitialFieldValueInput,
  ValidationResult,
  ValidatedFormValue,
  FormValidationError,
} from "./types";
import { runValidationFunction, validation } from "./validation";

export type ValidationFunctionToValidatedValue<
  Value,
  ValidationFunction extends (
    ...args: any
  ) =>
    | { readonly validity: "valid"; readonly value: Value }
    | { readonly validity: "invalid"; readonly error: unknown }
> = Extract<ReturnType<ValidationFunction>, { validity: "valid" }>["value"];

export type ValidationFunctionToValidationError<
  ObjectFieldMap extends ObjectFieldBase,
  ValidationFunction extends ObjectValidationFn<ObjectFieldMap>
> = ValidationFunction extends ObjectValidationFn<
  ObjectFieldMap,
  ObjectValue<ObjectFieldMap>,
  infer ValidationError
>
  ? ValidationError
  : undefined;

type ObjectValidationFn<
  ObjectFieldMap extends ObjectFieldBase,
  ValidatedValue extends ObjectValue<ObjectFieldMap> = ObjectValue<
    ObjectFieldMap
  >,
  ValidationError = unknown
> = (
  value: PreviousResult<ObjectFieldMap>
) =>
  | { validity: "valid"; value: ValidatedValue }
  | { validity: "invalid"; error: ValidationError };

type ObjectFieldBase = { [key: string]: Field<any, any, any, any, any, any> };

type ValidationOptionToValidationFn<
  ObjectFieldMap extends ObjectFieldBase,
  ValidationFunction extends ObjectValidationFn<ObjectFieldMap> | undefined
> = [ValidationFunction] extends [ObjectValidationFn<ObjectFieldMap>]
  ? ValidationFunction
  : ObjectValidationFn<
      ObjectFieldMap,
      ObjectValidatedInternalValue<ObjectFieldMap>,
      undefined
    >;

type ObjectOptionsToDefaultOptions<
  ObjectFieldMap extends ObjectFieldBase,
  Obj extends OptionsBase<ObjectFieldMap>
> = [Obj] extends [OptionsBaseNonNullable<ObjectFieldMap>]
  ? {
      validate: ValidationOptionToValidationFn<ObjectFieldMap, Obj["validate"]>;
    }
  : {
      validate: ObjectValidationFn<
        ObjectValue<ObjectFieldMap>,
        ObjectValidatedInternalValue<ObjectFieldMap>,
        undefined
      >;
    };

type ObjectValue<ObjectFieldMap extends ObjectFieldBase> = {
  readonly [Key in keyof ObjectFieldMap]: ReturnType<
    ObjectFieldMap[Key]["getInitialValue"]
  >;
};

type ObjectValidatedInternalValue<ObjectFieldMap extends ObjectFieldBase> = {
  readonly [Key in keyof ObjectFieldMap]: ValidationFunctionToValidatedValue<
    ObjectValue<ObjectFieldMap>,
    ObjectFieldMap[Key]["validate"]
  >;
};

type ObjectFieldMapToField<
  ObjectFieldMap extends ObjectFieldBase,
  Options extends OptionsBase<ObjectFieldMap> | undefined
> = Field<
  ObjectValue<ObjectFieldMap>,
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
    ValidationFunctionToValidatedValue<
      ObjectValue<ObjectFieldMap>,
      ObjectOptionsToDefaultOptions<ObjectFieldMap, Options>["validate"]
    >,
    ValidationFunctionToValidationError<
      ObjectFieldMap,
      ObjectOptionsToDefaultOptions<ObjectFieldMap, Options>["validate"]
    >
  >,
  {
    fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getInitialMeta"]
      >;
    };
  },
  ValidationFunctionToValidatedValue<
    ObjectValue<ObjectFieldMap>,
    ObjectOptionsToDefaultOptions<ObjectFieldMap, Options>["validate"]
  >,
  ValidationFunctionToValidationError<
    ObjectFieldMap,
    ObjectOptionsToDefaultOptions<ObjectFieldMap, Options>["validate"]
  >
>;

type ObjectValueFromFieldMap<ObjectFieldMap extends ObjectFieldBase> = {
  readonly [Key in keyof ObjectFieldMap]: ReturnType<
    ObjectFieldMap[Key]["getInitialValue"]
  >;
};

type PreviousResult<ObjectFieldMap extends ObjectFieldBase> = ValidationResult<
  ObjectValueFromFieldMap<ObjectFieldMap>,
  {
    readonly [Key in keyof ObjectFieldMap]: ValidatedFormValue<
      ObjectFieldMap[Key]
    >;
  },
  {
    readonly [Key in keyof ObjectFieldMap]: FormValidationError<
      ObjectFieldMap[Key]
    >;
  }
>;

type OptionsBase<ObjectFieldMap extends ObjectFieldBase> =
  | OptionsBaseNonNullable<ObjectFieldMap>
  | undefined;
type OptionsBaseNonNullable<ObjectFieldMap extends ObjectFieldBase> = {
  validate?: ObjectValidationFn<ObjectFieldMap>;
};

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
  Options extends OptionsBase<ObjectFieldMap>
>(
  fields: ObjectFieldMap,
  options?: Options
): ObjectFieldMapToField<ObjectFieldMap, Options> {
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
      if (options === undefined || options.validate === undefined) {
        return areAllFieldsValid
          ? validation.valid(value)
          : validation.invalid(errors);
      }
      return options.validate(
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
