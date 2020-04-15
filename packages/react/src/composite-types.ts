import { ValidationResult, ValidationFunctionToValidatedValue } from "./types";

export type CompositeTypes<
  Value,
  InteralValidatedValue extends Value = Value,
  InternalValidationResults = unknown
> = {
  value: Value;
  internalValidated: InteralValidatedValue;
  internalValidationResults: InternalValidationResults;
};

export type ValidationFunctionToValidationError<
  SpecificCompositeTypes extends CompositeTypes<unknown>,
  ValidationFunction extends ObjectValidationFn<SpecificCompositeTypes>
> = ValidationFunction extends ObjectValidationFn<
  SpecificCompositeTypes,
  SpecificCompositeTypes["value"],
  infer ValidationError
>
  ? ValidationError
  : undefined;

type ObjectValidationFn<
  SpecificCompositeTypes extends CompositeTypes<unknown>,
  ValidatedValue extends SpecificCompositeTypes["value"] = SpecificCompositeTypes["value"],
  ValidationError = unknown
> = (
  value: PreviousResult<SpecificCompositeTypes>
) =>
  | { validity: "valid"; value: ValidatedValue }
  | { validity: "invalid"; error: ValidationError };

type DefaultObjectValidationFn<
  SpecificCompositeTypes extends CompositeTypes<unknown>
> = ObjectValidationFn<
  SpecificCompositeTypes,
  SpecificCompositeTypes["internalValidated"],
  SpecificCompositeTypes["internalValidationResults"]
>;

type ValidationOptionToValidationFn<
  SpecificCompositeTypes extends CompositeTypes<unknown>,
  ValidationFunction extends
    | ObjectValidationFn<SpecificCompositeTypes>
    | undefined
> = [ValidationFunction] extends [ObjectValidationFn<SpecificCompositeTypes>]
  ? ValidationFunction
  : DefaultObjectValidationFn<SpecificCompositeTypes>;

type ObjectOptionsToDefaultOptions<
  SpecificCompositeTypes extends CompositeTypes<unknown>,
  Options extends OptionsBase<SpecificCompositeTypes>
> = {
  validate: [Options] extends [OptionsBaseNonNullable<SpecificCompositeTypes>]
    ? ValidationOptionToValidationFn<
        SpecificCompositeTypes,
        Options["validate"]
      >
    : DefaultObjectValidationFn<SpecificCompositeTypes>;
};

type PreviousResult<
  SpecificCompositeTypes extends CompositeTypes<unknown>
> = ValidationResult<
  SpecificCompositeTypes["value"],
  SpecificCompositeTypes["internalValidated"],
  SpecificCompositeTypes["internalValidationResults"]
>;

export type OptionsBase<
  SpecificCompositeTypes extends CompositeTypes<unknown>
> = OptionsBaseNonNullable<SpecificCompositeTypes> | undefined;
type OptionsBaseNonNullable<
  SpecificCompositeTypes extends CompositeTypes<unknown>
> = {
  validate?: ObjectValidationFn<SpecificCompositeTypes>;
};

export type ValidatedValueFromOptions<
  SpecificCompositeTypes extends CompositeTypes<unknown>,
  Options extends OptionsBase<SpecificCompositeTypes>
> = ValidationFunctionToValidatedValue<
  SpecificCompositeTypes["value"],
  ObjectOptionsToDefaultOptions<SpecificCompositeTypes, Options>["validate"]
>;

export type ValidationErrorFromOptions<
  SpecificCompositeTypes extends CompositeTypes<unknown>,
  Options extends OptionsBase<SpecificCompositeTypes>
> = ValidationFunctionToValidationError<
  SpecificCompositeTypes,
  ObjectOptionsToDefaultOptions<SpecificCompositeTypes, Options>["validate"]
>;
