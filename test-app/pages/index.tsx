import React, { ChangeEvent } from "react";
import { types, useForm, validation } from "@magical-forms/react";

const text = types.scalar<string>()({
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
});

let testForm = types.object({
  // thing: arrayField,
  something: textField,
  // another: text({
  //   validate(val) {
  //     if (val === undefined) return validation.invalid("yes" as const);
  //     return validation.valid(val);
  //   },
  // }),
  // other: field.select({
  //   validate(value) {
  //     if (value === undefined) return validation.invalid("required");
  //     return validation.valid(value);
  //   },
  // }),
});

export default function Index() {
  let form = useForm(testForm);
  console.log(form);

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
      <input {...form.fields.something.props} />
      {form.fields.something.validity}
      {form.validity}
      {/* <RawTypes<typeof textField> /> */}
      <button disabled={form.validity !== "valid"}>Submit</button>
    </form>
  );
}
