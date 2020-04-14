import React, { ChangeEvent } from "react";
import {
  field,
  makeField,
  useForm,
  validation,
  ValidationFn,
  Field,
  ValidationResult,
} from "@magical-forms/react";
import { RawTypes } from "@magical-types/macro/write-data-to-fs.macro";

type BaseOptions<Value> = NonNullableBaseOptions<Value> | undefined;

type NonNullableBaseOptions<Value> = {
  validate?: ValidationFn<Value, Value, unknown> | undefined;
};

type ValidationOptionToValidationFn<
  Value,
  ValidationFunction extends ValidationFn<Value, Value, unknown> | undefined
> = [ValidationFunction] extends [ValidationFn<Value, Value, unknown>]
  ? ValidationFunction
  : ValidationFn<Value, Value, undefined>;

type OptionsToDefaultOptions<Value, Obj extends BaseOptions<Value>> = [
  Obj
] extends [NonNullableBaseOptions<Value>]
  ? {
      validate: ValidationOptionToValidationFn<Value, Obj["validate"]>;
    }
  : {
      validate: ValidationFn<Value, Value, undefined>;
    };

function getDefaultValidate(options: any) {
  return options !== undefined && options.validate !== undefined
    ? options.validate
    : (val: any) => validation.valid(val);
}

type ValidationFunctionToValidatedValue<
  Value,
  ValidationFunction extends ValidationFn<Value, Value, unknown>
> = Extract<ReturnType<ValidationFunction>, { validity: "valid" }>["value"];

type ValidationFunctionToValidationError<
  Value,
  ValidationFunction extends ValidationFn<Value, Value, unknown>
> = ValidationFunction extends ValidationFn<Value, Value, infer ValidationError>
  ? ValidationError
  : undefined;

type BasicField<Value, Props, Options> = Field<
  Value,
  Value,
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
  },
  { touched: boolean },
  ValidationFunctionToValidatedValue<
    Value,
    OptionsToDefaultOptions<Value, Options>["validate"]
  >,
  ValidationFunctionToValidationError<
    Value,
    OptionsToDefaultOptions<Value, Options>["validate"]
  >
>;

let text = <Options extends BaseOptions<string | undefined>>(
  options?: Options
): BasicField<
  string | undefined,
  {
    value: string;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
    onBlur(): void;
  },
  Options
> => ({
  getField(input) {
    return {
      ...input,
      props: {
        value: (input.value as string) || "",
        onChange(event: ChangeEvent<HTMLInputElement>) {
          let val = event.target.value;
          input.setValue(val === "" ? undefined : val);
        },
        onBlur() {
          if (input.meta.touched === false) {
            input.setMeta({ touched: true });
          }
        },
      },
    };
  },
  getInitialValue: (initialValueInput: string | undefined) => initialValueInput,
  getInitialMeta: () => ({
    touched: false,
  }),
  validate: getDefaultValidate(options),
});

let textField = text({
  validate: (value) => {
    if (value === undefined) return validation.invalid("required");
    if (value === "thing") return validation.invalid("cannot be thing");

    return validation.valid(value);
  },
});

let testForm = field.object(
  {
    something: textField,
    another: text({
      validate(val) {
        if (val === undefined) return validation.invalid("yes" as const);
        return validation.valid(val);
      },
    }),
    other: field.select({
      validate(value) {
        if (value === undefined) return validation.invalid("required");
        return validation.valid(value);
      },
    }),
  },
  {
    validate(x) {
      return x;
    },
  }
);

export default function Index() {
  let form = useForm(testForm);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.fields.another;
        form.value.something;
        if (form.validity === "valid") {
          alert(form.value.other);
          let _x: string = form.value.another;
          let _y: "yes" | undefined = form.fields.another.error;
        }
      }}
    >
      <input {...form.fields.something.props} />
      {form.fields.something.validity}
      {form.validity}
      {/* <RawTypes<typeof textField> /> */}
      <button disabled={form.validity !== "valid"}>Submit</button>
    </form>
  );
}
