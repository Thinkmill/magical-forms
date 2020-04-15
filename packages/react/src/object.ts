import { mapObject } from "./map-obj";

import {
  Field,
  InitialFieldValueInput,
  ValidationResult,
  ValidationFunctionToValidatedValue,
  FormValue,
} from "./types";
import { runValidationFunction, validation } from "./validation";
import {
  OptionsBase,
  ValidatedValueFromOptions,
  ValidationErrorFromOptions,
  CompositeTypes,
} from "./composite-types";

type ObjectFieldBase = {
  [key: string]: Field<any, any, any, any, any, any>;
};

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

type ObjectCompositeTypes<
  ObjectFieldMap extends ObjectFieldBase
> = CompositeTypes<
  ObjectValue<ObjectFieldMap>,
  ObjectValidatedInternalValue<ObjectFieldMap>,
  ObjectValidationResults<ObjectFieldMap>
>;

type ObjectFieldMapToField<
  ObjectFieldMap extends ObjectFieldBase,
  SpecificCompositeTypes extends ObjectCompositeTypes<ObjectFieldMap>,
  ValidatedValue extends SpecificCompositeTypes["value"],
  ValidationError
> = Field<
  SpecificCompositeTypes["value"],
  | {
      [Key in keyof ObjectFieldMap]?: InitialFieldValueInput<
        ObjectFieldMap[Key]
      >;
    }
  | undefined,
  {
    readonly props: {
      value: SpecificCompositeTypes["value"];
      onChange(value: SpecificCompositeTypes["value"]): void;
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

export function object<
  ObjectFieldMap extends ObjectFieldBase,
  Options extends OptionsBase<ObjectCompositeTypes<ObjectFieldMap>>
>(
  fields: ObjectFieldMap,
  options?: Options
): ObjectFieldMapToField<
  ObjectFieldMap,
  ObjectCompositeTypes<ObjectFieldMap>,
  ValidatedValueFromOptions<ObjectCompositeTypes<ObjectFieldMap>, Options>,
  ValidationErrorFromOptions<ObjectCompositeTypes<ObjectFieldMap>, Options>
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
