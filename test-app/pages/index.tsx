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

let textField = field.text({
  validate: (value) => {
    if (value === undefined) return validation.invalid("required");
    if (value === "thing") return validation.invalid("cannot be thing");

    return validation.valid(value);
  },
});

let testForm = field.object(
  {
    something: textField,
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
          alert(form.value.something);
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
