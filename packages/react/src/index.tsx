import * as compositeFields from "@magical-forms/field-composite";
import * as domFields from "@magical-forms/field-dom";

export const field: typeof compositeFields & typeof domFields = {
  ...compositeFields,
  ...domFields,
};

export { useForm } from "@magical-forms/use-form";
export { validation } from "@magical-forms/validation";
export * from "@magical-forms/types";
