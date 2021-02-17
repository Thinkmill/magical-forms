import React, { ChangeEvent } from "react";
import { scalar, useForm, object, validation } from "@magical-forms/react";

export const text = scalar({
  props: ({ onChange, validity, error, ...field }) => ({
    ...field,
    onChange(event: ChangeEvent<HTMLInputElement>) {
      onChange(event.target.value);
    },
  }),
  initialValue: (input: string | undefined) => input || "",
});

let textField = text({
  validate: (value) => {
    if (!value) return validation.invalid("required");
    if (value === "thing") return validation.invalid("cannot be thing");

    return validation.valid(value);
  },
  stateFromChange: (current, next) => {
    if (next.value === "something") {
      return {
        value: "else",
        touched: true
      };
    }
    return next;
  },
});

let testForm = object({
    something: textField,
    another: textField,
  },
);

export default function Index() {
  let form = useForm(testForm);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // form.fields.another;
        // form.value.something;
        // let _x: string | undefined = form.value.another;
        // if (form.validity === "valid") {
        //   // alert(form.value.other);
        //   let _x: string = form.value.another;
        //   let _y: "yes" | undefined = form.fields.another.error;
        // }
      }}
    >
      <label>
        Something
        <input {...form.fields.something.props} />
      </label>
      <label>
        Another
        <input {...form.fields.another.props} />
      </label>
      {/* <RawTypes<typeof textField> /> */}
      <button disabled={form.validity !== "valid"}>Submit</button>
    </form>
  );
}
