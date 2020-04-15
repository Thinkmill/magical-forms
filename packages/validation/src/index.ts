import { ValidationFn, ValidationResult } from "@magical-forms/types";

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
    } as const;
  }
  return {
    validity: "invalid",
    value,
    error: result.error,
  } as const;
}

export function getDefaultValidate(options: any) {
  return options !== undefined && options.validate !== undefined
    ? options.validate
    : (val: any) => validation.valid(val);
}

export const validation = {
  valid<ValidValue>(value: ValidValue) {
    return { validity: "valid" as const, value } as const;
  },
  invalid<Error>(error: Error) {
    return { validity: "invalid" as const, error } as const;
  },
};
