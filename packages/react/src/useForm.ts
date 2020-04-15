import { InitialFieldValueInput, Field, Form } from "./types";
import { useState } from "react";
import { runValidationFunction } from "./validation";

export function useForm<FormField extends Field<any, any, any, any, any, any>>(
  field: FormField,
  initialValue?: InitialFieldValueInput<FormField>
): Form<FormField> {
  let [value, setValue] = useState(() => field.getInitialValue(initialValue));
  let [meta, setMeta] = useState(() => field.getInitialMeta(value));

  return field.getField({
    ...runValidationFunction(field.validate, value),
    setValue: (val) => {
      setValue(() => val);
    },
    meta,
    setMeta: (val) => {
      setMeta(() => val);
    },
  });
}
