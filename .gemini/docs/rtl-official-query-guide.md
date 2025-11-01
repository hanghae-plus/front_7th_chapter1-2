# React Testing Library: Official Query Guide
This document outlines the official rules and classifications for queries in Testing Library.

## 1. The Query Priority Guide
*(1. 쿼리 우선순위: 사용자와 가까운 'Role', 'Label', 'Text' 등을 'TestId'보다 항상 우선한다.)*

- **Rule:** Always use the following queries in this order of priority. This ensures tests are accessible, user-centric, and resilient to implementation changes.

1.  **`getByRole(...)`**: (Highest Priority) For accessibility. Users (and screen readers) navigate by roles.
2.  **`getByLabelText(...)`**: Best for form elements.
3.  **`getByPlaceholderText(...)`**:
4.  **`getByText(...)`**: Good for non-interactive elements (div, span, p).
5.  **`getByDisplayValue(...)`**: For form elements with a current value.
6.  **`getByAltText(...)`**: For images (`<img>`).
7.  **`getByTitle(...)`**: For elements with a `title` attribute.
8.  **`getByTestId(...)`**: (Lowest Priority) Only use as a last resort if no other query works.

## 2. The Three Query Types
*(2. 세 가지 쿼리 타입: 'getBy'(즉시/에러), 'queryBy'(즉시/null), 'findBy'(비동기/에러)를 구분한다.)*

- **`getBy...`**: (Asserts Existence)
    - **Use:** To find an element that **must** be present *immediately*.
    - **Result:** Returns the element or **throws an error** if not found.
    - *Example:* `expect(screen.getByRole('button')).toBeInTheDocument()`

- **`queryBy...`**: (Asserts Absence)
    - **Use:** To find an element that **must not** be present.
    - **Result:** Returns the element or `null` (does not throw).
    - *Example:* `expect(screen.queryByRole('alert')).not.toBeInTheDocument()`

- **`findBy...`**: (Asserts Asynchronous Existence)
    - **Use:** To find an element that will appear **asynchronously** (e.g., after an API call).
    - **Result:** Returns a Promise that resolves with the element or **throws an error** if not found after a timeout.
    - *Example:* `const submitButton = await screen.findByRole('button', { name: /Submit/i })`

## 3. Multiple Elements (`...AllBy...`)
*(3. 다중 요소: 여러 개를 찾을 땐 '...AllBy...' (e.g., 'getAllByRole')를 사용한다.)*

- **Rule:** All three query types (`getBy`, `queryBy`, `findBy`) have a plural (`...AllBy...`) version.
    - `getAllBy...`: Returns an array of elements or throws an error.
    - `queryAllBy...`: Returns an array of elements or an empty array `[]` (does not throw).
    - `findAllBy...`: Returns a Promise that resolves with an array of elements or throws.
- *Example:* `const listItems = screen.getAllByRole('listitem')`

## 4. General Best Practices
*(4. 일반 규칙: 'screen' 객체를 사용하고, 텍스트 매칭 시 정규식(Regex)을 활용한다.)*

- **Use `screen`**: Always import and use the `screen` object for queries. Do not destructure from `render`.
    - *Example:* `import { render, screen } from '@testing-library/react';`
- **Text Matching**: Queries that search for text (like `getByText`, or `getByRole` with a `name` option) can accept:
    - A **String**: `screen.getByText('Hello World')` (case-sensitive)
    - A **Regular Expression (Regex)**: `screen.getByText(/hello world/i)` (flexible, ignores case)
    - A **Function**: `screen.getByText((content, element) => ...)` (most powerful)
- **Rule:** Prefer Regular Expressions with the `/i` flag (case-insensitive) for flexible text matching.