# @magical-forms/react-next

## 0.3.1

### Patch Changes

- [`72c9c66`](https://github.com/Thinkmill/magical-forms/commit/72c9c665f551633e47c45759f040d60d6d16eea4) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed setting array fields to an empty array not working

## 0.3.0

### Minor Changes

- [`f59b99d`](https://github.com/Thinkmill/magical-forms/commit/f59b99dd5d78d81863c6ac8339c021bc29a8dab2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `array` field which is similar to the `object` field except that you provide it a single field and it stores an array of that field(the field that's provided could be another array field, object field or scalar field). Unless you provide an initial value for an array field, it will default to an empty array.

  An example form:

  ```jsx
  import {
    array,
    getInitialState,
    object,
    scalar,
    useForm,
    validation
  } from "@magical-forms/react-next";

  const text = scalar({
    props: ({ onBlur, onChange, touched, error, value }) => {
      return { onChange, onBlur, value, error: touched ? error : undefined };
    },
    initialValue: (input: string | undefined) => input || ""
  });

  let i = 0;

  const key = scalar({
    props: ({ value }) => value,
    initialValue: () => i++
  });

  const element = object({
    key: key(),
    value: text({
      validate(value) {
        if (!value.length) {
          return validation.invalid("Must not be empty");
        }
        return validation.valid(value);
      }
    })
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
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
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

* [`f59b99d`](https://github.com/Thinkmill/magical-forms/commit/f59b99dd5d78d81863c6ac8339c021bc29a8dab2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Switched the order of the arguments provided to `stateFromChange` in scalar fields so that it is `(next, current)` to be consistent with `stateFromChange` in object fields and the new `array` field. `current` may also now be undefined when adding a new element to an array field.

### Patch Changes

- [`f59b99d`](https://github.com/Thinkmill/magical-forms/commit/f59b99dd5d78d81863c6ac8339c021bc29a8dab2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix "Type instantiation is excessively deep and possibly infinite" error on newer versions of TypeScript

## 0.2.3

### Patch Changes

- [`cafd7fb`](https://github.com/Thinkmill/magical-forms/commit/cafd7fb7c250139e9bda0125943fe4b60c155205) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Rename `getInitialValue` to `getInitialState` and fix the return type

## 0.2.2

### Patch Changes

- [`b6e56f6`](https://github.com/Thinkmill/magical-forms/commit/b6e56f6a523739deba7d82acfc148bbcb3596aa6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `getInitialValue`

## 0.2.1

### Patch Changes

- [`2ea82a1`](https://github.com/Thinkmill/magical-forms/commit/2ea82a13f697ae2f2516717f49c87218b8944049) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `resetForm`

## 0.2.0

### Minor Changes

- [`d61e4c8`](https://github.com/Thinkmill/magical-forms/commit/d61e4c8905c4287b2938070b30eb1a4acc1ecb55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Expose some more internal types

## 0.1.5

### Patch Changes

- [`be847c4`](https://github.com/Thinkmill/magical-forms/commit/be847c4be4bed455cfd9c41774c355e10d5c5801) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix a type bug

## 0.1.4

### Patch Changes

- [`0982f00`](https://github.com/Thinkmill/magical-forms/commit/0982f00c6918a3af50d798d55c297d4d116de4f6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add \_field property to field instances

## 0.1.3

### Patch Changes

- [`aab7aa0`](https://github.com/Thinkmill/magical-forms/commit/aab7aa052b69f10e8d7ec168e94d423e938d4a80) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix a bug with various types

## 0.1.2

### Patch Changes

- [`2fabeb1`](https://github.com/Thinkmill/magical-forms/commit/2fabeb1115c83aca309cfd63dfff2b0d1495dec1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add touched to scalar field props function input

## 0.1.1

### Patch Changes

- [`a7ffae9`](https://github.com/Thinkmill/magical-forms/commit/a7ffae9195b0fff2bbc92a996d738faaf19ed472) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix some bugs with validation

## 0.1.0

### Minor Changes

- [`3f7aa3e`](https://github.com/Thinkmill/magical-forms/commit/3f7aa3e7a8e0fd466b33c3aa98f0f0cbb95819cd) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
