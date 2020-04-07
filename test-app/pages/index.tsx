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

let textForm = field.text({
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
