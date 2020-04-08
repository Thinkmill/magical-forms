import { ChangeEvent } from "react";
import { ValidationFn, makeField, BasicFieldInput } from "./types";
import { object } from "./object";
import { array } from "./array";

export const field = {
  object,
  array,
  string: <ValidatedValue extends string | undefined, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(
        input
      ): BasicFieldInput<
        string | undefined,
        {},
        ValidatedValue,
        ValidationError
      > & {
        props: {
          value: string | undefined;
          onChange(value: string | undefined): void;
        };
      } {
        return {
          ...input,
          props: { value: input.value, onChange: input.setValue },
        };
      },
      getInitialValue: (initialValueInput: string | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
  text: <ValidatedValue extends string | undefined, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(
        input
      ): BasicFieldInput<
        string | undefined,
        { touched: boolean },
        ValidatedValue,
        ValidationError
      > & {
        props: {
          value: string;
          onChange(event: ChangeEvent<HTMLInputElement>): void;
          onBlur(): void;
        };
      } {
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
      getInitialValue: (initialValueInput: string | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({
        touched: false,
      }),
      validate,
    }),
  number: <ValidatedValue extends number | undefined, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<number | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: {
            value: input.value,
            onChange(event: ChangeEvent<HTMLInputElement>) {
              let number = Number(event.target.value);
              input.setValue(isNaN(number) ? undefined : number);
            },
          },
        };
      },
      getInitialValue: (initialValueInput: number | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
  select: <ValidatedValue extends string | undefined, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(
        input
      ): BasicFieldInput<
        string | undefined,
        { touched: boolean },
        ValidatedValue,
        ValidationError
      > & {
        props: {
          value: string | undefined;
          onChange(event: ChangeEvent<HTMLSelectElement>): void;
          onBlur(): void;
        };
      } {
        return {
          ...input,
          props: {
            value: input.value,
            onChange(event: ChangeEvent<HTMLSelectElement>) {
              input.setValue(event.target.value);
            },
            onBlur() {
              if (input.meta.touched === false) {
                input.setMeta({ touched: true });
              }
            },
          },
        };
      },
      getInitialValue: (initialValueInput: string | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({ touched: false }),
      validate,
    }),
  checkbox: <ValidatedValue extends boolean, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<boolean, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(
        input
      ): BasicFieldInput<
        boolean,
        { touched: boolean },
        ValidatedValue,
        ValidationError
      > & {
        props: {
          checked: boolean;
          onChange(event: ChangeEvent<HTMLInputElement>): void;
          onBlur(): void;
        };
      } {
        return {
          ...input,
          props: {
            checked: input.value,
            onChange(event: ChangeEvent<HTMLInputElement>) {
              input.setValue(event.target.checked);
            },
            onBlur() {
              if (input.meta.touched === false) {
                input.setMeta({ touched: true });
              }
            },
          },
        };
      },
      getInitialValue: (initialValueInput: boolean | undefined = false) =>
        initialValueInput,
      getInitialMeta: () => ({ touched: false }),
      validate,
    }),
};
