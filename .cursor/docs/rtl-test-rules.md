# Common Mistakes with React Testing Library

This document summarizes Kent C. Dodds' guidelines on common mistakes when using React Testing Library and best practices to avoid them. Agents can reference this to write robust and maintainable test code.

---

## ✅ Recommended Practices

1. **Use ESLint Plugins**

   - Use `eslint-plugin-testing-library` and `eslint-plugin-jest-dom` to improve code quality and reduce mistakes.

2. **Use `screen` for Queries**

   - Prefer `screen` over destructuring the return value of `render`. It simplifies queries and improves maintainability.

3. **Use `jest-dom` Assertions**

   - Example: use `expect(button).toBeDisabled()` instead of `expect(button.disabled).toBe(true)`.

4. **Avoid Explicit `cleanup` Calls**
   - `cleanup` is automatic in recent versions, so explicit calls are unnecessary.

---

## ❌ Common Mistakes to Avoid

1. **Using `wrapper` Variable Name**

   - Returning `wrapper` from `render` is an old Enzyme style. Destructure only the utilities you need instead.

2. **Unnecessary `act` Calls**

   - `render` and `fireEvent` are already wrapped in `act`, so additional calls are redundant.

3. **Incorrect Assertions**
   - Avoid primitive property checks (`button.disabled`). Use `jest-dom` matchers for readability and maintainability.

---

## Notes for Agents

- Follow these recommendations to write reliable, readable, and maintainable tests.
- Emphasize queries that reflect how users interact with the UI (`getByRole`, `getByLabelText`, etc.).
- Minimize boilerplate and unnecessary wrappers.
