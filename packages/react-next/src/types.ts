import {
  ScalarField,
  FormValueFromScalarField,
  FormStateFromScalarField,
  ScalarFieldInstance,
  ValidatedFormValueFromScalarField,
  InitialValueFromScalarField,
} from "./scalar";
import {
  ObjectField,
  FormValueFromFieldsObj,
  FormStateFromFieldsObj,
  ObjectFieldInstance,
  ValidatedFormValueFromObjectField,
  InitialValueFromObjectField,
} from "./object";

export type FormValue<TField extends Field> = TField extends ScalarField
  ? FormValueFromScalarField<TField>
  : TField extends ObjectField<any>
  ? FormValueFromFieldsObj<TField["fields"]>
  : never;

export type Field = ScalarField | ObjectField<any>;

export type FormState<TField extends Field> = TField extends ScalarField
  ? FormStateFromScalarField<TField>
  : TField extends ObjectField<any>
  ? FormStateFromFieldsObj<TField["fields"]>
  : never;

export type InitialValueInput<TField extends Field> = TField extends ScalarField
  ? InitialValueFromScalarField<TField>
  : TField extends ObjectField<any>
  ? InitialValueFromObjectField<TField>
  : never;

export type ValidatedFormValue<
  TField extends Field
> = TField extends ScalarField
  ? ValidatedFormValueFromScalarField<TField>
  : TField extends ObjectField<any>
  ? ValidatedFormValueFromObjectField<TField["fields"]>
  : never;

// maybe rename this to FormInstance
export type Form<TField extends Field> = TField extends ScalarField
  ? ScalarFieldInstance<TField>
  : TField extends ObjectField<any>
  ? ObjectFieldInstance<TField>
  : never;
