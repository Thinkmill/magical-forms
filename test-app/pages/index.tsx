import React from "react";
import {
  array,
  getInitialState,
  object,
  scalar,
  useForm,
  validation,
} from "@magical-forms/react-next";

const text = scalar({
  props: ({ onBlur, onChange, touched, error, value }) => {
    return {
      onChange,
      onBlur,
      value,
      error: touched ? error : undefined,
    };
  },
  initialValue: (input: string | undefined) => input || "",
});

let i = 0;

const key = scalar({
  props: ({ value }) => value,
  initialValue: () => i++,
});

const element = object({
  key: key(),
  value: text({
    validate(value) {
      if (!value.length) {
        return validation.invalid("Must not be empty");
      }
      return validation.valid(value);
    },
  }),
});

const schema = array(element);

export default function Index() {
  let form = useForm(schema, [{}]);
  return (
    <div>
      <ul>
        {form.elements.map((element, i) => {
          return (
            <li key={element.fields.key.value}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <TextInput {...element.fields.value.props} />
                <button
                  onClick={() => {
                    const newState = [...form.state];
                    newState.splice(i, 1);
                    form.setState(newState);
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => {
          form.setState([...form.state, getInitialState(element)]);
        }}
      >
        Add Item
      </button>
      <button
        onClick={() => {
          form.setState([]);
        }}
      >
        Remove all
      </button>
    </div>
  );
}

function TextInput(props: {
  value: string;
  onChange(value: string): void;
  onBlur(): void;
  error?: string;
}) {
  return (
    <div>
      <input
        value={props.value}
        onBlur={() => {
          props.onBlur();
        }}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
      <div style={{ color: "red" }}>{props.error}</div>
    </div>
  );
}
