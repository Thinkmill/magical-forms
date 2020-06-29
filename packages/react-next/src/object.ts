import {
  ScalarField,
  ValidatedFormValueFromScalarField,
  ScalarValidationFn,
} from "./scalar";
import {
  FormState,
  Field,
  FormValue,
  ValidatedFormValue,
  InitialValueInput,
  Form,
} from "./types";
import { getValueFromState, getFieldInstance } from "./utils";

export type FormValueFromFieldsObj<
  Fields extends { readonly [Key in keyof Fields]: Field }
> = {
  readonly [Key in keyof Fields]: FormValue<Fields[Key]>;
};

export type FormStateFromFieldsObj<
  Fields extends { readonly [Key in keyof Fields]: Field }
> = {
  readonly [Key in keyof Fields]: FormState<Fields[Key]>;
};

type ValidationFnInObjectValidation<Field extends ScalarField, ObjectValue> = (
  value: ValidatedFormValueFromScalarField<Field>,
  objectValue: ObjectValue
) =>
  | {
      readonly validity: "valid";
      readonly value: ValidatedFormValueFromScalarField<Field>;
    }
  | {
      readonly validity: "invalid";
      readonly error: string;
    };

export type ValidationObj<FieldsObj, ObjectValue> = {
  readonly [Key in keyof FieldsObj]?: FieldsObj[Key] extends ScalarField
    ? ValidationFnInObjectValidation<FieldsObj[Key], ObjectValue>
    : FieldsObj[Key] extends ObjectField<any>
    ? ValidationObj<FieldsObj[Key]["fields"], ObjectValue>
    : never;
};

export type ValidatedFormValueFromObjectField<
  TObjectField extends ObjectField<any>
> = {
  readonly [Key in TObjectField["fields"]]: ValidatedFormValue<
    TObjectField["fields"][Key]
  >;
};

type ObjectFieldInitialInfoThing<TObjectField extends ObjectField<any>> = {
  [Key in keyof TObjectField["fields"]]: InitialValueInput<
    TObjectField["fields"][Key]
  >;
};

type UndefinedKeys<Obj extends object> = {
  [Key in keyof Obj]: undefined extends Obj[Key] ? Key : never;
}[keyof Obj];

type AllowUndefinedIfEmptyObject<Thing extends {}> = {} extends Thing
  ? undefined | Thing
  : Thing;

export type InitialValueFromObjectField<
  TObjectField extends ObjectField<any>,
  Thing extends ObjectFieldInitialInfoThing<
    TObjectField
  > = ObjectFieldInitialInfoThing<TObjectField>
> = AllowUndefinedIfEmptyObject<
  Pick<Partial<Thing>, UndefinedKeys<Thing>> & Omit<Thing, UndefinedKeys<Thing>>
>;

export type ObjectFieldInstance<TObjectField extends ObjectField<any>> = {
  readonly setState: (
    object: Partial<FormStateFromFieldsObj<TObjectField["fields"]>>
  ) => void;
  readonly state: FormStateFromFieldsObj<TObjectField["fields"]>;
  readonly fields: {
    readonly [Key in keyof TObjectField["fields"]]: Form<
      TObjectField["fields"][Key]
    >;
  };
  readonly _schema: TObjectField;
} & (
  | {
      readonly validity: "valid";
      readonly value: ValidatedFormValueFromObjectField<TObjectField>;
    }
  | {
      readonly validity: "invalid";
      readonly value: FormValueFromFieldsObj<TObjectField["fields"]>;
    }
);

function getFieldValidity(
  field: Field,
  validationResult: any
): "valid" | "invalid" {
  if (field.kind === "scalar") {
    return validationResult.validity;
  }
  return Object.keys(field.fields).every(
    (key) =>
      getFieldValidity(field.fields[key], validationResult[key]) === "valid"
  )
    ? "valid"
    : "invalid";
}

export function getObjectFieldInstance(
  field: ObjectField<any>,
  state: FormStateFromFieldsObj<any>,
  setState: (
    state: (
      prevState: FormStateFromFieldsObj<any>
    ) => FormStateFromFieldsObj<any>
  ) => void,
  validationResult: any
): ObjectFieldInstance<any> {
  let fields: any = {};
  Object.keys(field.fields).forEach((key) => {
    fields[key] = getFieldInstance(
      field.fields[key],
      state[key],
      (thing: any) => {
        setState((prevState) => {
          let newInnerState = thing(prevState[key]);
          return {
            ...prevState,
            [key]: newInnerState,
          };
        });
      },
      validationResult[key]
    );
  });
  return {
    fields,
    state,
    setState: (partial) => {
      setState((prevState) => {
        let newState: any = { ...prevState };
        Object.keys(partial).forEach((key) => {
          if (partial[key] !== undefined) {
            newState[key] = partial[key];
          }
        });
        return newState;
      });
    },
    validity: getFieldValidity(field, validationResult),
    value: getValueFromState(field, state),
    _schema: field,
  };
}

export type ObjectField<
  Fields extends { readonly [Key in keyof Fields]: Field }
> = {
  readonly kind: "object";
  readonly fields: Fields;
  readonly validate:
    | ValidationObj<Fields, FormValueFromFieldsObj<Fields>>
    | undefined;
  // this API is still def bad but meh
  readonly stateFromChange:
    | ((
        current: FormStateFromFieldsObj<Fields>,
        next: FormStateFromFieldsObj<Fields>
      ) => FormStateFromFieldsObj<Fields>)
    | undefined;
};

export function object<
  Fields extends { readonly [Key in keyof Fields]: Field }
>(
  fields: Fields,
  options?: {
    validate?: ValidationObj<Fields, FormValueFromFieldsObj<Fields>>;
    stateFromChange?: (
      current: FormStateFromFieldsObj<Fields>,
      next: FormStateFromFieldsObj<Fields>
    ) => FormStateFromFieldsObj<Fields>;
  }
): ObjectField<Fields> {
  return {
    kind: "object",
    fields,
    validate: options?.validate,
    stateFromChange: options?.stateFromChange,
  };
}
