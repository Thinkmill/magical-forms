export type ScalarValidationFn<Value, ValidatedValue extends Value> = (
  value: Value
) =>
  | { readonly validity: "valid"; readonly value: ValidatedValue }
  | { readonly validity: "invalid"; readonly error: string };

export type ScalarValidationResult<Value, ValidatedValue extends Value> =
  | {
      readonly validity: "valid";
      readonly value: ValidatedValue;
      readonly error?: string;
    }
  | {
      readonly validity: "invalid";
      readonly error: string;
      readonly value: Value;
    };

type FormPropsInput<Value> = {
  readonly value: Value;
  readonly onBlur: () => void;
  readonly onFocus: () => void;
  readonly onChange: (value: Value) => void;
} & (
  | {
      readonly validity: "valid";
      readonly error?: string;
    }
  | { readonly validity: "invalid"; readonly error: string }
);

let emptyFn = () => {};

export function getScalarFieldInstance<TScalarField extends ScalarField>(
  field: TScalarField,
  state: ScalarState<any>,
  setState: (
    state: (prevState: ScalarState<TScalarField>) => ScalarState<TScalarField>
  ) => void,
  validationResult: ScalarValidationResult<
    FormValueFromScalarField<TScalarField>,
    ValidatedFormValueFromScalarField<TScalarField>
  >
): ScalarFieldInstance<TScalarField> {
  return {
    ...validationResult,
    state,
    props: field.props({
      onBlur: () =>
        setState((prevState) => {
          if (prevState.touched) {
            return prevState;
          }
          return {
            value: prevState.value,
            touched: true,
          };
        }),
      onChange: (value) => {
        setState((prevState) => {
          if (prevState.value === value) {
            return prevState;
          }
          return {
            value: value,
            touched: prevState.touched,
          };
        });
      },
      onFocus: emptyFn,
      ...validationResult,
    }),
    setState: (stateUpdate) => {
      if (typeof stateUpdate === "function") {
        // @ts-ignore
        setState(stateUpdate);
      } else {
        setState(() => stateUpdate);
      }
    },
  };
}

export type ScalarFieldInstance<Field extends ScalarField> = {
  readonly props: ReturnType<Field["props"]>;
  readonly setState: (
    state:
      | ScalarState<FormValueFromScalarField<Field>>
      | ((
          prevState: ScalarState<FormValueFromScalarField<Field>>
        ) => ScalarState<FormValueFromScalarField<Field>>)
  ) => void;
  readonly state: ScalarState<FormValueFromScalarField<Field>>;
} & ScalarValidationResult<
  FormValueFromScalarField<Field>,
  ValidatedFormValueFromScalarField<Field>
>;

export type ScalarState<Value> = { value: Value; touched: boolean };

export type ScalarField<
  Value = any,
  InitialValue = any,
  TValidationFn extends ScalarValidationFn<Value, Value> = ScalarValidationFn<
    Value,
    Value
  >,
  Props = any
> = {
  kind: "scalar";
  validate: TValidationFn;
  props: (input: FormPropsInput<Value>) => Props;
  stateFromChange?: (
    current: ScalarState<Value>,
    next: ScalarState<Value>
  ) => ScalarState<Value>;
  initialValue: (initialValue: InitialValue) => Value;
};

type NonUndefinedScalarOptionsBase<Value> = {
  validate?: ScalarValidationFn<Value, Value>;
  stateFromChange?: (
    current: ScalarState<Value>,
    next: ScalarState<Value>
  ) => ScalarState<Value>;
};

type ScalarOptionsBase<Value> =
  | NonUndefinedScalarOptionsBase<Value>
  | undefined;

type ValidationFnFromOptions<
  Value,
  Options extends ScalarOptionsBase<Value>
> = Options extends NonUndefinedScalarOptionsBase<Value>
  ? Options["validate"] extends ScalarValidationFn<Value, Value>
    ? Options["validate"]
    : ScalarValidationFn<Value, Value>
  : ScalarValidationFn<Value, Value>;

export type ValidatedFormValueFromScalarField<
  Field extends ScalarField
> = Field["validate"] extends ScalarValidationFn<any, infer ValidatedValue>
  ? ValidatedValue
  : never;

export type FormStateFromScalarField<Field extends ScalarField> = {
  value: FormValueFromScalarField<Field>;
  touched: boolean;
};

export type FormValueFromScalarField<Field extends ScalarField> = ReturnType<
  Field["initialValue"]
>;

export function scalar<Value, InitialValueInput, Props>(scalarFieldOptions: {
  props: (input: FormPropsInput<Value>) => Props;
  initialValue: (initialValueInput: InitialValueInput) => Value;
}) {
  return function <Options extends ScalarOptionsBase<Value>>(
    options?: Options
  ): ScalarField<
    Value,
    InitialValueInput,
    ValidationFnFromOptions<Value, Options>,
    Props
  > {
    // @ts-ignore
    return {
      kind: "scalar",
      initialValue: scalarFieldOptions.initialValue,
      stateFromChange: options?.stateFromChange,
      props: scalarFieldOptions.props,
      // @ts-ignore
      validate:
        options?.validate || ((value) => ({ validity: "valid", value })),
    };
  };
}

export type InitialValueFromScalarField<
  TScalarField extends ScalarField
> = Parameters<TScalarField["initialValue"]>[0];
