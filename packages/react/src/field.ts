import { ChangeEvent } from "react";
import {
  ValidationFn,
  makeField,
  Field,
  BasicOptions,
  BasicField,
} from "./types";
import { object } from "./object";
import { array } from "./array";
import { getDefaultValidate } from "./validation";

type Yes = { yes: true };

type DoThing<Val> = [Val] extends [(...args: any) => any]
  ? {
      parameters: Parameters<Val>;
    }
  : Yes;

function x<
  Options extends { key?: (...args: any) => any | undefined } | undefined
>(thing?: Options): Options extends object ? DoThing<Options["key"]> : Yes {
  if (thing === undefined) {
    return { thing: true } as any;
  }
  return {
    parameters: [] as any[],
  } as any;
}

let thing = x({ key: (thing: string) => "" });

let thing2 = x();

export const field = {
  object,
  array,
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
      validate,
    }),
};
