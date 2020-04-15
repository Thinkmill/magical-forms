import { mapObject } from "./map-obj";

import {
  Field,
  InitialFieldValueInput,
  ValidationResult,
  ValidationFunctionToValidatedValue,
  FormValue,
} from "./types";
import { runValidationFunction, validation } from "./validation";

type ObjectFieldBase = { [key: string]: Field<any, any, any, any, any, any> };

type ObjectValue<ObjectFieldMap extends ObjectFieldBase> = {
  readonly [Key in keyof ObjectFieldMap]: FormValue<ObjectFieldMap[Key]>;
};

type ObjectValidatedInternalValue<ObjectFieldMap extends ObjectFieldBase> = {
  readonly [Key in keyof ObjectFieldMap]: ValidationFunctionToValidatedValue<
    ObjectValue<ObjectFieldMap>,
    ObjectFieldMap[Key]["validate"]
  >;
};

type ObjectValidationResults<ObjectFieldMap extends ObjectFieldBase> = {
  readonly [Key in keyof ObjectFieldMap]: ReturnType<
    ObjectFieldMap[Key]["validate"]
  >;
};

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

type DefaultObjectValidationFn<
  ObjectFieldMap extends ObjectFieldBase
> = ObjectValidationFn<
  ObjectFieldMap,
  ObjectValidatedInternalValue<ObjectFieldMap>,
  ObjectValidationResults<ObjectFieldMap>
>;

type ValidationOptionToValidationFn<
  ObjectFieldMap extends ObjectFieldBase,
  ValidationFunction extends ObjectValidationFn<ObjectFieldMap> | undefined
> = [ValidationFunction] extends [ObjectValidationFn<ObjectFieldMap>]
  ? ValidationFunction
  : DefaultObjectValidationFn<ObjectFieldMap>;

type ObjectOptionsToDefaultOptions<
  ObjectFieldMap extends ObjectFieldBase,
  Options extends OptionsBase<ObjectFieldMap>
> = {
  validate: [Options] extends [OptionsBaseNonNullable<ObjectFieldMap>]
    ? ValidationOptionToValidationFn<ObjectFieldMap, Options["validate"]>
    : DefaultObjectValidationFn<ObjectFieldMap>;
};

type ObjectFieldMapToField<
  ObjectFieldMap extends ObjectFieldBase,
  ValidatedValue extends ObjectValue<ObjectFieldMap>,
  ValidationError
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
      value: ObjectValue<ObjectFieldMap>;
      onChange(value: ObjectValue<ObjectFieldMap>): void;
    };
    readonly fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getField"]
      >;
    };
  } & ValidationResult<
    ObjectValue<ObjectFieldMap>,
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

type PreviousResult<ObjectFieldMap extends ObjectFieldBase> = ValidationResult<
  ObjectValue<ObjectFieldMap>,
  ObjectValidatedInternalValue<ObjectFieldMap>,
  ObjectValidationResults<ObjectFieldMap>
>;

type OptionsBase<ObjectFieldMap extends ObjectFieldBase> =
  | OptionsBaseNonNullable<ObjectFieldMap>
  | undefined;
type OptionsBaseNonNullable<ObjectFieldMap extends ObjectFieldBase> = {
  validate?: ObjectValidationFn<ObjectFieldMap>;
};

export function object<
  ObjectFieldMap extends ObjectFieldBase,
  Options extends OptionsBase<ObjectFieldMap>
>(
  fields: ObjectFieldMap,
  options?: Options
): ObjectFieldMapToField<
  ObjectFieldMap,
  ValidationFunctionToValidatedValue<
    ObjectValue<ObjectFieldMap>,
    ObjectOptionsToDefaultOptions<ObjectFieldMap, Options>["validate"]
  >,
  ValidationFunctionToValidationError<
    ObjectFieldMap,
    ObjectOptionsToDefaultOptions<ObjectFieldMap, Options>["validate"]
  >
> {
  return {
    getField(input) {
      return {
        ...input,
        props: {
          value: input.value as ObjectValue<ObjectFieldMap>,
          onChange: input.setValue,
        },
        fields: mapObject(fields, (sourceKey, sourceValue) =>
          sourceValue.getField({
            ...runValidationFunction(
              sourceValue.validate,
              input.value[sourceKey]
            ),
            setValue: (val: any) => {
              input.setValue({
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
        sourceValue.getInitialMeta(value[sourceKey])
      ),
    }),
    validate: (value) => {
      let innerResult = mapObject(fields, (sourceKey, sourceValue) =>
        runValidationFunction(sourceValue.validate, value[sourceKey])
      );
      let areAllFieldsValid = Object.values(innerResult).every(
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
}
