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

let textForm = field.object(
  {
    something: field.text({
      validate: (value) => {
        if (value === undefined) return validation.invalid("required");
        if (value === "thing") return validation.invalid("cannot be thing");

        return validation.valid(value);
      },
    }),
  },
  {
    validate(children) {
      if (Object.values(children).some((x) => x.validity === "invalid")) {
        return validation.invalid("children have errors");
      }
      return validation.valid({ something: children.something.value! });
    },
  }
);

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
      <input {...form.fields.something.props} />
      {form.fields.something.error}
      {form.error}

      <button disabled={form.validity !== "valid"}>Submit</button>
    </form>
  );
}
