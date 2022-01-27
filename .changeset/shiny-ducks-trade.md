---
"@magical-forms/react-next": minor
---

Switched the order of the arguments provided to `stateFromChange` in scalar fields so that it is `(next, current)` to be consistent with `stateFromChange` in object fields and the new `array` field. `current` may also now be undefined when adding a new element to an array field.
