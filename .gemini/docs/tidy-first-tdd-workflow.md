# Senior Developer Workflow (TDD & Tidy First)

This document defines the development methodology for a Senior Software Engineer following Kent Beck's Test-Driven Development (TDD) and Tidy First principles.

## 1. Core Development Principles
*(1. 핵심 개발 원칙: TDD 사이클을 따르고, 항상 코드를 깔끔하게 유지하며, 구조 변경과 기능 변경을 분리한다.)*

- Always follow the TDD cycle: **Red → Green → Refactor**.
- Write the simplest failing test first.
- Implement the *minimum* code needed to make tests pass.
- Refactor *only* after tests are passing (GREEN).
- Follow Beck's **"Tidy First"** approach by separating structural changes from behavioral changes.
- Maintain high code quality throughout development.

## 2. The TDD Cycle (TypeScript/Jest)
*(2. TDD 사이클: '실패하는 테스트'를 먼저 작성하고, '최소한의 코드'로 통과시킨 후, '리팩토링'한다.)*

- **RED**: Start by writing a failing test in a `.test.ts` / `.test.tsx` file that defines a small increment of functionality. Use meaningful test names (e.g., `it('should sum two positive numbers')`).
- **GREEN**: Write *just enough* production code (in `.ts` / `.tsx` files) to make the failing test pass. No more.
- **REFACTOR**: Once all tests pass, consider if refactoring is needed.
- Repeat the cycle for new functionality.

## 3. "Tidy First" Approach
*(3. Tidy First 접근법: 코드의 '구조' 변경과 '기능' 변경을 절대 섞지 않는다.)*

- Separate all changes into two distinct types:
    1.  **STRUCTURAL CHANGES (Tidy):** Rearranging code without changing behavior.
        - *Examples:* Renaming variables/functions, extracting a React Hook, moving files, reformatting.
    2.  **BEHAVIORAL CHANGES (Feature):** Adding or modifying actual functionality.
        - *Examples:* Adding new logic to a function, implementing a new feature defined by a test.
- **Critical Rule:** Never mix structural and behavioral changes in the *same commit*.
- Always make structural changes first when both are needed.
- Validate structural changes by running all tests *before and after* the change to prove behavior was not altered.

## 4. Commit Discipline
*(4. 커밋 원칙: 모든 테스트가 통과하고, 린트(Linter) 경고가 없을 때만 커밋한다.)*

- Only commit when:
    1.  **ALL tests are passing.**
    2.  ALL TypeScript compiler and ESLint warnings have been resolved.
    3.  The change represents a *single* logical unit of work (either Structural or Behavioral).
- Commit messages must clearly state whether the commit contains **[Tidy]** (Structural) or **[Feature]** (Behavioral) changes.
- Use small, frequent commits.

## 5. Code Quality & Refactoring Standards
*(5. 코드 품질 및 리팩토링: 'Green' 상태에서만 리팩토링하며, 중복을 제거하고, 의도를 명확히 한다.)*

- Refactor only when tests are passing (in the "Green" phase).
- **Eliminate duplication ruthlessly.**
- Express intent clearly through naming and structure.
- Make dependencies (imports, props) explicit.
- Keep functions/components small and focused on a single responsibility.
- Minimize state and side effects.
- Use established refactoring patterns (e.g., "Extract Method," "Extract Component").
- Run tests after *each small refactoring step*.

## 6. Example Workflow (TypeScript/React)
*(6. TS/React 워크플로우 예시: TDD와 Tidy First를 따르는 구체적인 개발 순서.)*

1.  **[Tidy]**: Look at the code. Is it clean? If not, perform **Structural Changes** (e.g., rename a prop, extract a custom hook).
2.  Run tests to confirm they still pass.
3.  Commit: `git commit -m "Tidy: Extract useLogin logic into custom hook"`
4.  **[RED]**: Write a *new, simple* failing test for the next piece of functionality (e.g., `it('should show error on invalid password')`).
5.  Run tests, confirm *only* the new test fails.
6.  **[GREEN]**: Implement the *bare minimum* code to make the new test pass.
7.  Run all tests to confirm they pass.
8.  **[Behavioral Commit]**: Commit the new feature: `git commit -m "Feature: Show error on invalid password"`
9.  **[REFACTOR]**: Look at the new code. Is there duplication? Can it be cleaner? Refactor if needed, running tests after each step.
10. Commit refactoring: `git commit -m "Refactor: Simplify password validation logic"`
11. Repeat from step 1.