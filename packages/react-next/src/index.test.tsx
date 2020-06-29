import {
  useForm,
  object,
  scalar,
  validation,
  InitialValueInput,
  Form,
} from ".";
import { render } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";

// let text = scalar({
//   props: () => ({}),
//   initialValue: (thing: string) => thing,
// });

// let thing = object({ thing: text() });

// let result = useForm(thing, { thing: "" });

// result.fields.thing.setState({
//   touched: true,
//   value: "",
// });

let text = scalar({
  props: (x) => x,
  initialValue: (value?: string | undefined) => value || "",
});

test("validation order is correct", () => {
  let calls: string[] = [];
  let formSchema = object(
    {
      thing: text({
        validate: (value) => {
          calls.push("inner");
          if (value === "nope") {
            return validation.invalid("nope inner");
          }
          return validation.valid(value);
        },
      }),
    },
    {
      validate: {
        thing: (value) => {
          calls.push("outer");
          if (value === "outer") {
            return validation.invalid("nope outer");
          }
          return validation.valid(value);
        },
      },
    }
  );
  let form: Form<typeof formSchema> | undefined;
  function Comp() {
    form = useForm(formSchema);
    return null;
  }
  render(<Comp />);
  if (!form) {
    throw new Error("form not rendered");
  }
  expect(calls).toEqual(["inner", "outer"]);
  expect(form).toMatchInlineSnapshot(`
        Object {
          "fields": Object {
            "thing": Object {
              "error": undefined,
              "props": Object {
                "error": undefined,
                "onBlur": [Function],
                "onChange": [Function],
                "onFocus": [Function],
                "validity": "valid",
                "value": "",
              },
              "setState": [Function],
              "state": Object {
                "touched": false,
                "value": "",
              },
              "validity": "valid",
              "value": "",
            },
          },
          "setState": [Function],
          "state": Object {
            "thing": Object {
              "touched": false,
              "value": "",
            },
          },
          "validity": "valid",
          "value": Object {
            "thing": "",
          },
        }
    `);
  calls = [];
  let oldForm = form;
  form = undefined;
  act(() => {
    oldForm.setState({
      thing: {
        touched: oldForm.state.thing.touched,
        value: "nope",
      },
    });
  });
  if (!form) {
    throw new Error("form not rendered");
  }
  let newForm = (form as any) as Form<typeof formSchema>;
  expect(newForm.validity).toBe("invalid");
  expect(newForm.fields.thing.error).toBe("nope inner");
  expect(newForm).toMatchInlineSnapshot(`
    Object {
      "fields": Object {
        "thing": Object {
          "error": "nope inner",
          "props": Object {
            "error": "nope inner",
            "onBlur": [Function],
            "onChange": [Function],
            "onFocus": [Function],
            "validity": "invalid",
            "value": "nope",
          },
          "setState": [Function],
          "state": Object {
            "touched": false,
            "value": "nope",
          },
          "validity": "invalid",
          "value": "nope",
        },
      },
      "setState": [Function],
      "state": Object {
        "thing": Object {
          "touched": false,
          "value": "nope",
        },
      },
      "validity": "invalid",
      "value": Object {
        "thing": "nope",
      },
    }
  `);
});
