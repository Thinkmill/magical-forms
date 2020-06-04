import { ValidationResult, ValidationFunctionToValidatedValue } from "./types";

export type CompositeTypes<
  Value,
  InteralValidatedValue extends Value = Value,
  InternalValidationResults = unknown,
  Meta = unknown
> = {
  value: Value;
  internalValidated: InteralValidatedValue;
  internalValidationResults: InternalValidationResults;
  meta: Meta;
};

export type ValidationFunctionToValidationError<
  SpecificCompositeTypes extends CompositeTypes<unknown>
> = SpecificCompositeTypes["internalValidationResults"];

type ObjectValidationFn<
  SpecificCompositeTypes extends CompositeTypes<unknown>
> = (
  value: PreviousResult<SpecificCompositeTypes>
) => SpecificCompositeTypes["internalValidationResults"];

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
  stateFromChange?: (
    changedState: {
      value: SpecificCompositeTypes["value"];
      meta: SpecificCompositeTypes["meta"];
    },
    currentState: {
      value: SpecificCompositeTypes["value"];
      meta: SpecificCompositeTypes["meta"];
    }
  ) => {
    value: SpecificCompositeTypes["value"];
    meta: SpecificCompositeTypes["meta"];
  };
};
