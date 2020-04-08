import { ChangeEvent } from "react";
import { ValidationFn, makeField } from "./types";
import { object } from "./object";
import { array } from "./array";

export const field = {
  object,
  array,
  date: <ValidatedValue extends Date | undefined, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<Date | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: { value: input.value, onChange: input.setValue },
        };
      },
      getInitialValue: (initialValueInput: Date | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({ touched: false }),
      validate,
    }),
  string: <ValidatedValue extends string | undefined, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
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
  dateRange: <
    ValidatedValue extends { from?: Date; to?: Date },
    ValidationError
  >({
    validate,
  }: {
    validate: ValidationFn<
      { from?: Date; to?: Date },
      ValidatedValue,
      ValidationError
    >;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: { value: input.value, onChange: input.setValue },
        };
      },
      getInitialValue: (
        initialValueInput: { from?: Date; to?: Date } | undefined
      ) => initialValueInput || { from: undefined, to: undefined },
      getInitialMeta: () => {
        return {
          touched: false,
        };
      },
      validate,
    }),
  text: <ValidatedValue extends string | undefined, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<string | undefined, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: {
            value: input.value || "",
            onChange(event: ChangeEvent<HTMLInputElement>) {
              let val = event.target.value;
              input.setValue(val === "" ? undefined : val);
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
      getField(input) {
        return {
          ...input,
          props: {
            value: input.value,
            onChange(event: ChangeEvent<HTMLSelectElement>) {
              input.setValue(event.target.value);
            },
          },
        };
      },
      getInitialValue: (initialValueInput: string | undefined) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
  checkbox: <ValidatedValue extends boolean, ValidationError>({
    validate,
  }: {
    validate: ValidationFn<boolean, ValidatedValue, ValidationError>;
  }) =>
    makeField({
      getField(input) {
        return {
          ...input,
          props: {
            checked: input.value,
            onChange(event: ChangeEvent<HTMLInputElement>) {
              input.setValue(event.target.checked);
            },
          },
        };
      },
      getInitialValue: (initialValueInput: boolean | undefined = false) =>
        initialValueInput,
      getInitialMeta: () => ({}),
      validate,
    }),
};
