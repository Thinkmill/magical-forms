import { InitialFieldValueInput, Field, Form } from "./types";
import { useState } from "react";
import { runValidationFunction } from "./validation";

export function useForm<FormField extends Field<any, any, any, any, any, any>>(
  field: FormField,
  initialValue?: InitialFieldValueInput<FormField>
): Form<FormField> {
  let [state, setState] = useState(() => {
    let value = field.getInitialValue(initialValue);
    return {
      value,
      meta: field.getInitialMeta(value),
    };
  });

  return field.getField({
    ...runValidationFunction(field.validate, state.value),
    setValue: (val) => {
      setState((prev) =>
        field.getDerivedStateFromState
          ? field.getDerivedStateFromState(
              { value: val, meta: prev.meta },
              prev
            )
          : { value: val, meta: prev.meta }
      );
    },
    setState: (val) => {
      setState((prev) =>
        field.getDerivedStateFromState
          ? field.getDerivedStateFromState(val, prev)
          : val
      );
    },
    meta: state.meta,
  });
}
