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
  ObjectValidationResults<ObjectFieldMap>,
  {
    readonly fields: {
      readonly [Key in keyof ObjectFieldMap]: ReturnType<
        ObjectFieldMap[Key]["getInitialMeta"]
      >;
    };
  }
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
  SpecificCompositeTypes["meta"],
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
  let hasChildGetDerivedStateFromState = Object.values(fields).some(
    (x) => x.getDerivedStateFromState
  );
  let getDerivedStateFromState: any;
  if (!hasChildGetDerivedStateFromState && options?.stateFromChange) {
    getDerivedStateFromState = options.stateFromChange;
  } else if (hasChildGetDerivedStateFromState) {
    getDerivedStateFromState = (changed: any, current: any) => {
      let value: any = {};
      let meta: any = {};
      Object.keys(fields).forEach((key) => {
        if (fields[key].getDerivedStateFromState) {
          // @ts-ignore
          let state = fields[key].getDerivedStateFromState(
            { value: changed.value[key], meta: changed.meta.fields[key] },
            { value: current.value[key], meta: current.meta.fields[key] }
          );
          value[key] = state.value;
          meta[key] = state.meta;
        } else {
          value[key] = changed.value[key];
          meta[key] = changed.meta.fields[key];
        }
      });
      let state = { value, meta: { fields: meta } };
      if (options?.stateFromChange) {
        state = options.stateFromChange(state, current);
      }
      return state;
    };
  }

  return {
    // @ts-ignore
    type: "object",
    // @ts-ignore
    fields,
    getField(input) {
      return {
        ...input,
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
            setState: (val) => {
              input.setState({
                value: { ...input.value, [sourceKey]: val.value },
                meta: {
                  fields: { ...input.meta.fields, [sourceKey]: val.meta },
                },
              });
            },
          })
        ),
      };
    },
    getDerivedStateFromState,
    getInitialValue: (initialValue = {}) =>
      mapObject(fields, (sourceKey, sourceValue) =>
        sourceValue.getInitialValue(initialValue[sourceKey])
      ),
    getInitialMeta: (value) => ({
      fields: mapObject(fields, (sourceKey, sourceValue) =>
        sourceValue.getInitialMeta(value[sourceKey])
      ),
    }),
    // @ts-ignore
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
