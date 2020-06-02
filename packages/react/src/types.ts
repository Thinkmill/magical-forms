export type BasicFieldInput<
  FieldValue,
  Meta,
  ValidatedValue,
  ValidationError
> = {
  setValue: (value: FieldValue) => void;

  setState: (state: { value: FieldValue; meta: Meta }) => void;
  meta: Meta;
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
  | { readonly validity: "valid"; readonly value: ValidatedValue }
  | { readonly validity: "invalid"; readonly error: ValidationError };

export type FormValue<
  FormField extends Field<any, any, any, any, any, any>
> = ReturnType<FormField["getInitialValue"]>;

export type InitialFieldValueInput<
  FormField extends Field<any, any, any, any, any, any>
> = Parameters<FormField["getInitialValue"]>[0];

export type InvalidValidationResult<Value, ValidationError> = {
  readonly validity: "invalid";
  readonly value: Value;
  readonly error: ValidationError;
};

export type ValidValidationResult<ValidatedValue> = {
  readonly validity: "valid";
  readonly value: ValidatedValue;
  readonly error: undefined;
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
  readonly getInitialValue: (
    initialValueInput: InitialFieldValueInputType
  ) => Value;
  readonly getInitialMeta: (value: Value) => Meta;
  readonly getField: (
    input: BasicFieldInput<Value, Meta, ValidatedValue, ValidationError>
  ) => Input;
  readonly validate: ValidationFn<Value, ValidatedValue, ValidationError>;
  readonly getDerivedStateFromState?: (
    newState: { value: Value; meta: Meta },
    oldState: { value: Value; meta: Meta }
  ) => { value: Value; meta: Meta };
};

export type BasicOptions<Value> = NonNullableBaseOptions<Value> | undefined;

type NonNullableBaseOptions<Value> = {
  stateFromChange?: (
    changedState: { value: Value; meta: { touched: boolean } },
    currentState: { value: Value; meta: { touched: boolean } }
  ) => { value: Value; meta: { touched: boolean } };
  validate?: ValidationFn<Value, Value, unknown> | undefined;
};

type ValidationOptionToValidationFn<
  Value,
  ValidationFunction extends ValidationFn<Value, Value, unknown> | undefined
> = [ValidationFunction] extends [ValidationFn<Value, Value, unknown>]
  ? ValidationFunction
  : ValidationFn<Value, Value, undefined>;

export type OptionsToDefaultOptions<Value, Obj extends BasicOptions<Value>> = [
  Obj
] extends [NonNullableBaseOptions<Value>]
  ? {
      validate: ValidationOptionToValidationFn<Value, Obj["validate"]>;
    }
  : {
      validate: ValidationFn<Value, Value, undefined>;
    };

export type ValidationFunctionToValidatedValue<
  Value,
  ValidationFunction extends (
    ...args: any
  ) =>
    | { readonly validity: "valid"; readonly value: Value }
    | { readonly validity: "invalid"; readonly error: unknown }
> = Extract<ReturnType<ValidationFunction>, { validity: "valid" }>["value"];

export type ValidationFunctionToValidationError<
  Value,
  ValidationFunction extends ValidationFn<Value, Value, unknown>
> = ValidationFunction extends ValidationFn<Value, Value, infer ValidationError>
  ? ValidationError
  : undefined;

export type BasicField<
  Value,
  Props,
  Options,
  Meta = { touched: boolean },
  InputType = Value | undefined
> = Field<
  Value,
  InputType,
  ValidationResult<
    Value,
    ValidationFunctionToValidatedValue<
      Value,
      OptionsToDefaultOptions<Value, Options>["validate"]
    >,
    ValidationFunctionToValidationError<
      Value,
      OptionsToDefaultOptions<Value, Options>["validate"]
    >
  > & {
    props: Props;
    setValue: (value: Value) => void;
  },
  Meta,
  ValidationFunctionToValidatedValue<
    Value,
    OptionsToDefaultOptions<Value, Options>["validate"]
  >,
  ValidationFunctionToValidationError<
    Value,
    OptionsToDefaultOptions<Value, Options>["validate"]
  >
>;
