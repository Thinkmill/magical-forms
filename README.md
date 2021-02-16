# ✨ Magical Forms ✨

> Write forms in React that feel like ✨ magic ✨

Magical Forms is a framework that allows you to create flexible, composable forms.

It's expected that you'll use this library to create your own form framework in your component library.

## Getting Started

```bash
yarn add @magical-forms/react
```

## Basic example

Here is a minimum implementation...
```jsx
import { field, useForm } from '@magical-forms/react'


const App = () => {
  const form = useForm(field.text());

  return (
    <InputComponent
      label="Email"
      {
        ...form.fields.props,
        // These props are spread
        // onto the component
        // onChange: event => void;
        // onFocus: () => void;
        // onBlur: () => void;
        // value: string;
        // meta: { }
      }
    />
  );
}
```


...but it's likely you will have more than one field in your form...

```jsx
// this is your form schema - you will generally define this outside of your component
const loginForm = field.object({
  email: field.text(),
  password: field.text(),
});

const App = () => {
  const form = useForm(loginForm);

  return (
    <div>
      <InputComponent
        label="Email"
        {...form.fields.email.props}
      />
      <InputComponent
        label="Password"
        {...form.fields.password.props}
      />
    </div>
  );
}
```

## Available scalas
Magical Forms comes with these fields out of the box.
- text
- object

## Validation

```jsx
// this is your form schema - you will generally define this outside of your component
const loginForm = field.object({
  email: field.text({
    validate:
  }),
});

const App = () => {
  const form = useForm(loginForm);

  return (
    <div>
      <InputComponent
        label="Email"
        {...form.fields.email.props}
      />
    </div>
  );
}
```


## Thanks/Inspiration

- [`react-use-form-state`](https://github.com/wsmd/react-use-form-state) for the concept of having functions that return props for a certain kind of input
- [`sarcastic`](https://github.com/jamiebuilds/sarcastic) for some thoughts about writing schemaish things in a way that makes JS type systems happy
