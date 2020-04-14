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

type BaseOptions = NonNullableBaseOptions | undefined;

type NonNullableBaseOptions = {
  validate?:
    | ValidationFn<string | undefined, string | undefined, unknown>
    | undefined;
};

type ValidationOptionToValidationFn<
  ValidationFunction extends
    | ValidationFn<string | undefined, string | undefined, unknown>
    | undefined
> = [ValidationFunction] extends [
  ValidationFn<string | undefined, string | undefined, unknown>
]
  ? ValidationFunction
  : ValidationFn<string | undefined, string | undefined, undefined>;

type OptionsToDefaultOptions<Obj extends BaseOptions> = [Obj] extends [
  NonNullableBaseOptions
]
  ? {
      validate: ValidationOptionToValidationFn<Obj["validate"]>;
    }
  : {
      validate: ValidationFn<string | undefined, string | undefined, undefined>;
    };

function applyDefaultOptions<Options extends BaseOptions>(
  options?: Options
): OptionsToDefaultOptions<Options> {
  return {
    validate:
      options !== undefined && options.validate !== undefined
        ? options.validate
        : (val: string | undefined) => validation.valid(val),
  } as any;
}

type ValidationFunctionToValidatedValue<
  ValidationFunction extends ValidationFn<
    string | undefined,
    string | undefined,
    unknown
  >
> = Extract<ReturnType<ValidationFunction>, { validity: "valid" }>["value"];

type ValidationFunctionToValidationError<
  ValidationFunction extends ValidationFn<
    string | undefined,
    string | undefined,
    unknown
  >
> = Extract<ReturnType<ValidationFunction>, { validity: "invalid" }>["error"];

let text = <Options extends BaseOptions>(
  options?: Options
): Field<
  string | undefined,
  string | undefined,
  ValidationResult<
    string | undefined,
    ValidationFunctionToValidatedValue<
      OptionsToDefaultOptions<Options>["validate"]
    >,
    ValidationFunctionToValidationError<
      OptionsToDefaultOptions<Options>["validate"]
    >
  > & {
    props: {
      value: string;
      onChange(event: ChangeEvent<HTMLInputElement>): void;
      onBlur(): void;
    };
  },
  { touched: boolean },
  ValidationFunctionToValidatedValue<
    OptionsToDefaultOptions<Options>["validate"]
  >,
  ValidationFunctionToValidationError<
    OptionsToDefaultOptions<Options>["validate"]
  >
> =>
  makeField({
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
      } as any;
    },
    getInitialValue: (initialValueInput: string | undefined) =>
      initialValueInput,
    getInitialMeta: () => ({
      touched: false as boolean,
    }),
    validate: applyDefaultOptions(options).validate as any,
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
        form.value.something;
        if (form.validity === "valid") {
          alert(form.value.other);
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
