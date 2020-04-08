import { ValidationFn, ValidationResult, ValidValidationResult } from "./types";

export function runValidationFunction<
  Value,
  ValidationError,
  ValidatedValue extends Value
>(
  validationFn: ValidationFn<Value, ValidatedValue, ValidationError>,
  value: Value
): ValidationResult<Value, ValidatedValue, ValidationError> {
  let result = validationFn(value);
  if (result.validity === "valid") {
    return {
      validity: "valid",
      value: result.value,
      error: undefined,
    };
  }
  return {
    validity: "invalid" as const,
    value,
    error: result.error,
  };
}

export const validation = {
  valid<ValidValue>(value: ValidValue) {
    return { validity: "valid" as const, value };
  },
  invalid<Error>(error: Error) {
    return { validity: "invalid" as const, error };
  },
};
