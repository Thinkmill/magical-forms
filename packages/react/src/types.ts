export type BasicFieldInput<
  FieldValue,
  Meta,
  ValidatedValue,
  ValidationError
> = {
  setValue: (value: FieldValue) => void;
  meta: Meta;
  setMeta: (value: Meta) => void;
} & ValidationResult<FieldValue, ValidatedValue, ValidationError>;

export type Form<
  FormField extends Field<any, any, any, any, any, any>
> = FormField extends Field<any, any, infer Input, any, any, any>
  ? Input
  : never;

export type ValidatedFormValue<
  FormField extends Field<any, any, any, any, any, any>
> = FormField extends Field<any, any, any, any, infer ValidatedValue, any>
  ? ValidatedValue
  : never;

export type FormValidationError<
  FormField extends Field<any, any, any, any, any, any>
> = FormField extends Field<any, any, any, any, any, infer FormValidationError>
  ? FormValidationError
  : never;

export type ValidationFn<
  Value,
  ValidatedValue extends Value,
  ValidationError
> = (
  value: Value
) =>
  | { validity: "valid"; value: ValidatedValue }
  | { validity: "invalid"; error: ValidationError };

export type FormValue<
  FormField extends Field<any, any, any, any, any, any>
> = ReturnType<FormField["getInitialValue"]>;

export type InitialFieldValueInput<
  FormField extends Field<any, any, any, any, any, any>
> = Parameters<FormField["getInitialValue"]>[0];

export type InvalidValidationResult<Value, ValidationError> = {
  validity: "invalid";
  value: Value;
  error: ValidationError;
};

export type ValidValidationResult<ValidatedValue> = {
  validity: "valid";
  value: ValidatedValue;
  error: undefined;
};

export type ValidationResult<Value, ValidatedValue, ValidationError> =
  | InvalidValidationResult<Value, ValidationError>
  | ValidValidationResult<ValidatedValue>;

export type Field<
  Value,
  InitialFieldValueInputType,
  Input extends ValidationResult<Value, ValidatedValue, ValidationError>,
  Meta,
  ValidatedValue extends Value,
  ValidationError
> = {
  getInitialValue: (initialValueInput: InitialFieldValueInputType) => Value;
  getInitialMeta: (value: Value) => Meta;
  getField: (
    input: BasicFieldInput<Value, Meta, ValidatedValue, ValidationError>
  ) => Input;
  validate: ValidationFn<Value, ValidatedValue, ValidationError>;
};

export function makeField<
  Value,
  InitialFieldValueInputType,
  Input extends ValidationResult<Value, ValidatedValue, ValidationError>,
  Meta,
  ValidatedValue extends Value,
  ValidationError
>(
  field: Field<
    Value,
    InitialFieldValueInputType,
    Input,
    Meta,
    ValidatedValue,
    ValidationError
  >
): Field<
  Value,
  InitialFieldValueInputType,
  Input,
  Meta,
  ValidatedValue,
  ValidationError
> {
  return field;
}
