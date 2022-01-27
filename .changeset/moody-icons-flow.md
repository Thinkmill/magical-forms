---
"@magical-forms/react-next": minor
---

Added `array` field which is similar to the `object` field except that you provide it a single field and it stores an array of that field(the field that's provided could be another array field, object field or scalar field). Unless you provide an initial value for an array field, it will default to an empty array.

An example form:

```jsx
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
    return { onChange, onBlur, value, error: touched ? error : undefined };
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
    </div>
  );
}
```

Some important things going on here:

- Like the fields inside of an `object` field are on `form.fields`, the fields inside of an `array` field are on `form.elements`
- There is a `key` field, this is so that we have a consistent key to provide to React when removing/re-ordering elements. This isn't that important in this particular example but would be important if fields had components with their own state inside that should be preserved when removing/re-ordering elements.
- When adding a new item, we can use `getInitialState(element)` to easily default the state of an element using the same logic that is used when doing `useForm(element)`
