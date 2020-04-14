import React, { ChangeEvent } from "react";
import {
  field,
  makeField,
  useForm,
  validation,
  ValidationFn,
  Field,
  ValidationResult,
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
    another: field.text({
      validate(val) {
        if (val === undefined) return validation.invalid("yes" as const);
        return validation.valid(val);
      },
    }),
    other: field.select({
      validate(value) {
        if (value === undefined) return validation.invalid("required");
        return validation.valid(value);
      },
    }),
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
        form.fields.another;
        form.value.something;
        let _x: string | undefined = form.value.another;

        if (form.validity === "valid") {
          alert(form.value.other);
          let _x: string = form.value.another;
          let _y: "yes" | undefined = form.fields.another.error;
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
