import React, { ChangeEvent } from "react";
import {
  field,
  makeField,
  useForm,
  validation,
  InitialFieldValueInput,
  Form,
  BasicFieldInput,
} from "@magical-forms/react";
import { RawTypes } from "@magical-types/macro/write-data-to-fs.macro";

type ValidationFunction<Value, ValidationError, ValidatedValue> = (
  value: Value
) =>
  | { validity: "valid"; value: ValidatedValue }
  | {
      validity: "invalid";
      error: ValidationError;
    };

function runValidationFunction<Value, ValidationError, ValidatedValue = Value>(
  validationFn: ValidationFunction<Value, ValidationError, ValidatedValue>,
  value: Value
): ValidatedResult<Value, ValidatedValue, ValidationError> {
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

type ValidatedResult<Value, ValidatedValue, ValidationError> =
  | {
      validity: "invalid";
      value: Value;
      error: ValidationError;
    }
  | {
      validity: "valid";
      value: ValidatedValue;
      error: undefined;
    };

function text<ValidationError, ValidatedValue>({
  validate,
}: {
  validate: ValidationFunction<
    string | undefined,
    ValidationError,
    ValidatedValue
  >;
}) {
  return {
    getField: (
      input: BasicFieldInput<string | undefined, { touched: boolean }>
    ): Omit<
      BasicFieldInput<string | undefined, { touched: boolean }>,
      "value"
    > &
      ValidatedResult<string | undefined, ValidatedValue, ValidationError> & {
        touched: boolean;
        props: {
          value: string;
          onChange(event: ChangeEvent<HTMLInputElement>): void;
          onBlur(): void;
        };
      } => ({
      ...input,
      ...runValidationFunction(validate, input.value),
      touched: input.meta.touched,
      props: {
        value: input.value || "",
        onChange(event: ChangeEvent<HTMLInputElement>) {
          let value = event.target.value;
          input.setValue(value === "" ? undefined : value);
        },
        onBlur() {
          if (input.meta.touched !== true)
            input.setMeta({ ...input.meta, touched: true });
        },
      },
    }),
    getInitialValue: (initialValueInput: string | undefined) =>
      initialValueInput,
    getInitialMeta: () => {
      return {
        touched: false,
      };
    },
  };
}

let textForm = text({
  validate: (value) => {
    if (value === undefined) return validation.invalid("thing");
    return validation.valid(value);
  },
});

export default function Index() {
  let form = useForm(textForm);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (form.validity === "valid") {
          alert(form.value);
        }
      }}
    >
      <input {...form.props} />
      {form.touched && form.error}
      yes
      <button disabled={form.validity !== "valid"}>Submit</button>
    </form>
  );
}
