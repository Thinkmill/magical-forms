import { field } from "./field";
import { validation } from "./validation";
import { ValidatedFormValue } from "./types";

let text = field.text({
  validate(val) {
    return validation.valid(val);
  },
});
