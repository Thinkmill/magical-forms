import {
  useForm,
  object,
  scalar,
  validation,
  InitialValueInput,
  Form,
  ValidatedFormValue,
  FormState,
  FormValue,
  resetForm,
} from ".";
import { render } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { array } from "./array";

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
      something: object(
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
            thing: (value, other) => {
              expect(other).toEqual({
                thing: value,
              });

              calls.push("middle");
              if (value === "middle") {
                return validation.invalid("nope middle");
              }
              return validation.valid(value);
            },
          },
        }
      ),
    },
    {
      validate: {
        something: {
          thing: (value, other) => {
            expect(other).toEqual({
              something: { thing: value },
            });
            calls.push("outer");
            if (value === "outer") {
              return validation.invalid("nope outer");
            }
            return validation.valid(value);
          },
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
  expect(calls).toEqual(["inner", "middle", "outer"]);
  expect(form).toMatchInlineSnapshot(`
                            Object {
                              "_field": Object {
                                "fields": Object {
                                  "something": Object {
                                    "fields": Object {
                                      "thing": Object {
                                        "initialValue": [Function],
                                        "kind": "scalar",
                                        "props": [Function],
                                        "stateFromChange": undefined,
                                        "validate": [Function],
                                      },
                                    },
                                    "kind": "object",
                                    "stateFromChange": undefined,
                                    "validate": Object {
                                      "thing": [Function],
                                    },
                                  },
                                },
                                "kind": "object",
                                "stateFromChange": undefined,
                                "validate": Object {
                                  "something": Object {
                                    "thing": [Function],
                                  },
                                },
                              },
                              "fields": Object {
                                "something": Object {
                                  "_field": Object {
                                    "fields": Object {
                                      "thing": Object {
                                        "initialValue": [Function],
                                        "kind": "scalar",
                                        "props": [Function],
                                        "stateFromChange": undefined,
                                        "validate": [Function],
                                      },
                                    },
                                    "kind": "object",
                                    "stateFromChange": undefined,
                                    "validate": Object {
                                      "thing": [Function],
                                    },
                                  },
                                  "fields": Object {
                                    "thing": Object {
                                      "_field": Object {
                                        "initialValue": [Function],
                                        "kind": "scalar",
                                        "props": [Function],
                                        "stateFromChange": undefined,
                                        "validate": [Function],
                                      },
                                      "error": undefined,
                                      "props": Object {
                                        "error": undefined,
                                        "onBlur": [Function],
                                        "onChange": [Function],
                                        "onFocus": [Function],
                                        "touched": false,
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
                                },
                              },
                              "setState": [Function],
                              "state": Object {
                                "something": Object {
                                  "thing": Object {
                                    "touched": false,
                                    "value": "",
                                  },
                                },
                              },
                              "validity": "valid",
                              "value": Object {
                                "something": Object {
                                  "thing": "",
                                },
                              },
                            }
              `);
  calls = [];
  act(() => {
    form!.setState({
      something: {
        thing: {
          touched: form!.state.something.thing.touched,
          value: "nope",
        },
      },
    });
  });
  expect(form.validity).toBe("invalid");
  expect(form.fields.something.fields.thing.error).toBe("nope inner");
  expect(form).toMatchInlineSnapshot(`
                            Object {
                              "_field": Object {
                                "fields": Object {
                                  "something": Object {
                                    "fields": Object {
                                      "thing": Object {
                                        "initialValue": [Function],
                                        "kind": "scalar",
                                        "props": [Function],
                                        "stateFromChange": undefined,
                                        "validate": [Function],
                                      },
                                    },
                                    "kind": "object",
                                    "stateFromChange": undefined,
                                    "validate": Object {
                                      "thing": [Function],
                                    },
                                  },
                                },
                                "kind": "object",
                                "stateFromChange": undefined,
                                "validate": Object {
                                  "something": Object {
                                    "thing": [Function],
                                  },
                                },
                              },
                              "fields": Object {
                                "something": Object {
                                  "_field": Object {
                                    "fields": Object {
                                      "thing": Object {
                                        "initialValue": [Function],
                                        "kind": "scalar",
                                        "props": [Function],
                                        "stateFromChange": undefined,
                                        "validate": [Function],
                                      },
                                    },
                                    "kind": "object",
                                    "stateFromChange": undefined,
                                    "validate": Object {
                                      "thing": [Function],
                                    },
                                  },
                                  "fields": Object {
                                    "thing": Object {
                                      "_field": Object {
                                        "initialValue": [Function],
                                        "kind": "scalar",
                                        "props": [Function],
                                        "stateFromChange": undefined,
                                        "validate": [Function],
                                      },
                                      "error": "nope inner",
                                      "props": Object {
                                        "error": "nope inner",
                                        "onBlur": [Function],
                                        "onChange": [Function],
                                        "onFocus": [Function],
                                        "touched": false,
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
                                },
                              },
                              "setState": [Function],
                              "state": Object {
                                "something": Object {
                                  "thing": Object {
                                    "touched": false,
                                    "value": "nope",
                                  },
                                },
                              },
                              "validity": "invalid",
                              "value": Object {
                                "something": Object {
                                  "thing": "nope",
                                },
                              },
                            }
              `);
  act(() => {
    resetForm(form!, { something: { thing: "" } });
  });
  expect(form.value).toMatchInlineSnapshot(`
        Object {
          "something": Object {
            "thing": "",
          },
        }
    `);
  act(() => {
    resetForm(form!, { something: { thing: "something" } });
  });
  expect(form.value).toMatchInlineSnapshot(`
        Object {
          "something": Object {
            "thing": "something",
          },
        }
    `);
});

test("validation order is correct with an array", () => {
  let calls: string[] = [];
  let formSchema = array(
    object(
      {
        something: object(
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
              thing: (value, other) => {
                expect(other).toEqual({
                  thing: value,
                });

                calls.push("middle");
                if (value === "middle") {
                  return validation.invalid("nope middle");
                }
                return validation.valid(value);
              },
            },
          }
        ),
      },
      {
        validate: {
          something: {
            thing: (value, other) => {
              expect(other).toEqual({
                something: { thing: value },
              });
              calls.push("outer");
              if (value === "outer") {
                return validation.invalid("nope outer");
              }
              return validation.valid(value);
            },
          },
        },
      }
    ),
    {
      validate: {
        something: {
          thing(value, other) {
            expect(other).toEqual([
              {
                something: { thing: value },
              },
            ]);
            calls.push("full outer");
            if (value === "outer") {
              return validation.invalid("nope full outer");
            }
            return validation.valid(value);
          },
        },
      },
    }
  );
  let form: Form<typeof formSchema> | undefined;
  function Comp() {
    form = useForm(formSchema, [{ something: "" }]);
    return null;
  }
  render(<Comp />);
  if (!form) {
    throw new Error("form not rendered");
  }
  expect(calls).toEqual(["inner", "middle", "outer", "full outer"]);
  debugger;
  expect(form).toMatchInlineSnapshot(`
    Object {
      "_field": Object {
        "element": Object {
          "fields": Object {
            "something": Object {
              "fields": Object {
                "thing": Object {
                  "initialValue": [Function],
                  "kind": "scalar",
                  "props": [Function],
                  "stateFromChange": undefined,
                  "validate": [Function],
                },
              },
              "kind": "object",
              "stateFromChange": undefined,
              "validate": Object {
                "thing": [Function],
              },
            },
          },
          "kind": "object",
          "stateFromChange": undefined,
          "validate": Object {
            "something": Object {
              "thing": [Function],
            },
          },
        },
        "kind": "array",
        "stateFromChange": undefined,
        "validate": Object {
          "something": Object {
            "thing": [Function],
          },
        },
      },
      "elements": Array [
        Object {
          "_field": Object {
            "fields": Object {
              "something": Object {
                "fields": Object {
                  "thing": Object {
                    "initialValue": [Function],
                    "kind": "scalar",
                    "props": [Function],
                    "stateFromChange": undefined,
                    "validate": [Function],
                  },
                },
                "kind": "object",
                "stateFromChange": undefined,
                "validate": Object {
                  "thing": [Function],
                },
              },
            },
            "kind": "object",
            "stateFromChange": undefined,
            "validate": Object {
              "something": Object {
                "thing": [Function],
              },
            },
          },
          "fields": Object {
            "something": Object {
              "_field": Object {
                "fields": Object {
                  "thing": Object {
                    "initialValue": [Function],
                    "kind": "scalar",
                    "props": [Function],
                    "stateFromChange": undefined,
                    "validate": [Function],
                  },
                },
                "kind": "object",
                "stateFromChange": undefined,
                "validate": Object {
                  "thing": [Function],
                },
              },
              "fields": Object {
                "thing": Object {
                  "_field": Object {
                    "initialValue": [Function],
                    "kind": "scalar",
                    "props": [Function],
                    "stateFromChange": undefined,
                    "validate": [Function],
                  },
                  "error": undefined,
                  "props": Object {
                    "error": undefined,
                    "onBlur": [Function],
                    "onChange": [Function],
                    "onFocus": [Function],
                    "touched": false,
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
            },
          },
          "setState": [Function],
          "state": Object {
            "something": Object {
              "thing": Object {
                "touched": false,
                "value": "",
              },
            },
          },
          "validity": "valid",
          "value": Object {
            "something": Object {
              "thing": "",
            },
          },
        },
      ],
      "setState": [Function],
      "state": Array [
        Object {
          "something": Object {
            "thing": Object {
              "touched": false,
              "value": "",
            },
          },
        },
      ],
      "validity": "valid",
      "value": Array [
        Object {
          "something": Object {
            "thing": "",
          },
        },
      ],
    }
  `);
  calls = [];
  act(() => {
    form!.setState([
      {
        something: {
          thing: {
            touched: form!.state[0].something.thing.touched,
            value: "nope",
          },
        },
      },
    ]);
  });
  expect(form.validity).toBe("invalid");
  expect(form.elements[0].fields.something.fields.thing.error).toBe(
    "nope inner"
  );
  expect(form).toMatchInlineSnapshot(`
    Object {
      "_field": Object {
        "element": Object {
          "fields": Object {
            "something": Object {
              "fields": Object {
                "thing": Object {
                  "initialValue": [Function],
                  "kind": "scalar",
                  "props": [Function],
                  "stateFromChange": undefined,
                  "validate": [Function],
                },
              },
              "kind": "object",
              "stateFromChange": undefined,
              "validate": Object {
                "thing": [Function],
              },
            },
          },
          "kind": "object",
          "stateFromChange": undefined,
          "validate": Object {
            "something": Object {
              "thing": [Function],
            },
          },
        },
        "kind": "array",
        "stateFromChange": undefined,
        "validate": Object {
          "something": Object {
            "thing": [Function],
          },
        },
      },
      "elements": Array [
        Object {
          "_field": Object {
            "fields": Object {
              "something": Object {
                "fields": Object {
                  "thing": Object {
                    "initialValue": [Function],
                    "kind": "scalar",
                    "props": [Function],
                    "stateFromChange": undefined,
                    "validate": [Function],
                  },
                },
                "kind": "object",
                "stateFromChange": undefined,
                "validate": Object {
                  "thing": [Function],
                },
              },
            },
            "kind": "object",
            "stateFromChange": undefined,
            "validate": Object {
              "something": Object {
                "thing": [Function],
              },
            },
          },
          "fields": Object {
            "something": Object {
              "_field": Object {
                "fields": Object {
                  "thing": Object {
                    "initialValue": [Function],
                    "kind": "scalar",
                    "props": [Function],
                    "stateFromChange": undefined,
                    "validate": [Function],
                  },
                },
                "kind": "object",
                "stateFromChange": undefined,
                "validate": Object {
                  "thing": [Function],
                },
              },
              "fields": Object {
                "thing": Object {
                  "_field": Object {
                    "initialValue": [Function],
                    "kind": "scalar",
                    "props": [Function],
                    "stateFromChange": undefined,
                    "validate": [Function],
                  },
                  "error": "nope inner",
                  "props": Object {
                    "error": "nope inner",
                    "onBlur": [Function],
                    "onChange": [Function],
                    "onFocus": [Function],
                    "touched": false,
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
            },
          },
          "setState": [Function],
          "state": Object {
            "something": Object {
              "thing": Object {
                "touched": false,
                "value": "nope",
              },
            },
          },
          "validity": "invalid",
          "value": Object {
            "something": Object {
              "thing": "nope",
            },
          },
        },
      ],
      "setState": [Function],
      "state": Array [
        Object {
          "something": Object {
            "thing": Object {
              "touched": false,
              "value": "nope",
            },
          },
        },
      ],
      "validity": "invalid",
      "value": Array [
        Object {
          "something": Object {
            "thing": "nope",
          },
        },
      ],
    }
  `);
  act(() => {
    resetForm(form!, [{ something: { thing: "" } }]);
  });
  expect(form.value).toMatchInlineSnapshot(`
    Array [
      Object {
        "something": Object {
          "thing": "",
        },
      },
    ]
  `);
  act(() => {
    resetForm(form!, [{ something: { thing: "something" } }]);
  });
  expect(form.value).toMatchInlineSnapshot(`
    Array [
      Object {
        "something": Object {
          "thing": "something",
        },
      },
    ]
  `);
});

test("setting array field to an empty array works", () => {
  let formSchema = array(text());
  let form: Form<typeof formSchema> | undefined;
  function Comp() {
    form = useForm(formSchema, ["blah"]);
    return null;
  }
  render(<Comp />);
  if (!form) {
    throw new Error("form not rendered");
  }
  act(() => {
    form!.setState([]);
  });
  expect(form.value).toEqual([]);
});
