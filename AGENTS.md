# Project Agent Notes

## React Component Conventions

- Do not destructure component props in function parameters.
- Files that export a single React component should use a default export for the component.

## Event Typing

- Do not use React's `FormEvent` type for form submit handlers in this project.
- Use the specific event type that matches the element and handler instead.
