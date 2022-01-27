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
  ValidatedFormValueFromFieldsObj,
  InitialValueFromObjectField,
} from "./object";
import { ArrayField, ArrayFieldInstance } from "./array";

export type FormValue<TField extends Field> = TField extends ScalarField
  ? FormValueFromScalarField<TField>
  : TField extends ObjectField<any>
  ? FormValueFromFieldsObj<TField["fields"]>
  : TField extends ArrayField<any>
  ? readonly FormValue<TField["element"]>[]
  : never;

export type Field = ScalarField | ObjectField<any> | ArrayField<any>;

export type FormState<TField extends Field> = TField extends ScalarField
  ? FormStateFromScalarField<TField>
  : TField extends ObjectField<any>
  ? FormStateFromFieldsObj<TField["fields"]>
  : TField extends ArrayField<any>
  ? readonly FormState<TField["element"]>[]
  : never;

export type InitialValueInput<TField extends Field> = TField extends ScalarField
  ? InitialValueFromScalarField<TField>
  : TField extends ObjectField<any>
  ? InitialValueFromObjectField<TField>
  : TField extends ArrayField<any>
  ? readonly InitialValueInput<TField["element"]>[] | undefined
  : never;

export type ValidatedFormValue<
  TField extends Field
> = TField extends ScalarField
  ? ValidatedFormValueFromScalarField<TField>
  : TField extends ObjectField<any>
  ? ValidatedFormValueFromFieldsObj<TField["fields"]>
  : TField extends ArrayField<any>
  ? readonly ValidatedFormValue<TField["element"]>[] | undefined
  : never;

// maybe rename this to FormInstance
export type Form<TField extends Field> = TField extends ScalarField
  ? ScalarFieldInstance<TField>
  : TField extends ObjectField<any>
  ? ObjectFieldInstance<TField>
  : TField extends ArrayField<any>
  ? ArrayFieldInstance<TField>
  : never;
