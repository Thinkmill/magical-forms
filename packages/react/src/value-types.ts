import { BasicOptions, BasicField } from "./types";
import { getDefaultValidate } from "./validation";

export { object } from "./object";
// export { array } from "./array";

export function scalar<ErrorType>() {
  return <ValueType, InputValueType, Props>(field: {
    props: (
      field: {
        onFocus: () => void;
        onBlur: () => void;
        onChange: (value: ValueType) => void;
        value: ValueType;
        meta: { touched: boolean };
      } & (
        | { validity: "valid"; error?: ErrorType }
        | { validity: "invalid"; error: ErrorType }
      )
    ) => Props;
    initialValue: (inputInitialValue: InputValueType | undefined) => ValueType;
  }) => {
    return <Options extends BasicOptions<ValueType>>(
      options?: Options
    ): BasicField<
      ValueType,
      Props,
      Options,
      { touched: boolean },
      InputValueType
    > => {
      return {
        getField: ({ setState, setValue, meta, ...input }) => ({
          ...input,
          setValue,
          // @ts-ignore
          props: field.props({
            ...input,
            meta,
            onBlur: () => {
              setState({ value: input.value, meta: { touched: true } });
            },
            onFocus: () => {},
            onChange: setValue,
          }),
        }),
        getInitialValue: field.initialValue,
        getInitialMeta: () => ({ touched: false }),
        validate: getDefaultValidate(options),
      };
    };
  };
}
