# Project Agent Notes

- Do not destructure component props in function parameters. Accept a `props`
  object and read values from it.
- Avoid React's `FormEvent` type for form submits. It is deprecated in this
  project. Choose the correct current event type for the handler instead of
  relying on `FormEvent`.
