import { ChangeEvent } from "react";
import { ValidationFn, Field, BasicOptions, BasicField } from "./types";
import { object } from "./object";
import { array } from "./array";
import { getDefaultValidate } from "./validation";

export const field = {
  object,
  array,
  string: <Options extends BasicOptions<string | undefined>>(
    options?: Options
  ): BasicField<
    string | undefined,
    {
      value: string | undefined;
      onChange(event: string | undefined): void;
    },
    Options,
    {}
  > => ({
    getField(input) {
      return {
        ...input,
        props: { value: input.value, onChange: input.setValue },
      };
    },
    getInitialValue: (initialValueInput: string | undefined) =>
      initialValueInput,
    getInitialMeta: () => ({}),
    validate: getDefaultValidate(options),
  }),
  text: <Options extends BasicOptions<string | undefined>>(
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
    getInitialValue: (initialValueInput: string | undefined) =>
      initialValueInput,
    getInitialMeta: () => ({
      touched: false,
    }),
    validate: getDefaultValidate(options),
  }),
  number: <Options extends BasicOptions<number | undefined>>(
    options?: Options
  ): BasicField<
    number | undefined,
    {
      value: number | undefined;
      onChange(event: ChangeEvent<HTMLInputElement>): void;
    },
    Options,
    {}
  > => ({
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
    validate: getDefaultValidate(options),
  }),
  select: <Options extends BasicOptions<string | undefined>>(
    options?: Options
  ): BasicField<
    string | undefined,
    {
      value: string | undefined;
      onChange(event: ChangeEvent<HTMLSelectElement>): void;
    },
    Options
  > => ({
    getField(input) {
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
    validate: getDefaultValidate(options),
  }),
  checkbox: <Options extends BasicOptions<boolean>>(
    options?: Options
  ): BasicField<
    boolean,
    {
      checked: boolean;
      onChange(event: ChangeEvent<HTMLInputElement>): void;
      onBlur(): void;
    },
    Options
  > => ({
    getField(input) {
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
    validate: getDefaultValidate(options),
  }),
};
