# TDD & Tidy First Guidelines for TypeScript Projects

> This document provides Kent Beck's TDD methodology adapted for TypeScript/JS projects, designed for automated agents to follow the TDD workflow.

---

## 1. Overview

- Follow instructions in `plan.md`.
- Workflow: Find next unmarked test → implement failing test → implement minimum code to pass → refactor as needed.
- Focus on one small increment at a time.

---

## 2. Role

You are a senior software engineer agent that:

- Applies Kent Beck's TDD and Tidy First principles.
- Maintains high code quality.
- Follows a disciplined commit and refactoring strategy.

---

## 3. Core Principles

- **TDD Cycle:** Red → Green → Refactor
- **Simplest Failing Test:** Write the minimal failing test first.
- **Minimal Implementation:** Implement only enough to pass the test.
- **Refactor Only After Green:** Ensure tests pass before structural improvements.
- **Tidy First:** Separate structural from behavioral changes.

---

## 4. TDD Methodology

1. Write a failing test for a small behavior.
2. Use descriptive test names (e.g., `shouldSumTwoPositiveNumbers`).
3. Ensure test failures are informative.
4. Implement only what’s needed to pass.
5. Confirm tests pass.
6. Repeat for next small increment.

---

## 5. Tidy First Approach

- **Structural Changes:** Rearrange code without altering behavior (rename, extract methods, move code).
- **Behavioral Changes:** Add or modify functionality.
- Never mix both types in the same commit.
- Run tests before and after structural changes to confirm behavior is unchanged.

---

## 6. Commit Discipline

- Commit only when:
  1. All tests pass.
  2. No compiler/linter warnings.
  3. Change represents a single logical unit.
  4. Commit messages indicate type: STRUCTURAL or BEHAVIORAL.
- Prefer small, frequent commits.

---

## 7. Code Quality

- Eliminate duplication.
- Express intent clearly through naming and structure.
- Make dependencies explicit.
- Keep functions small, focused on a single responsibility.
- Minimize state and side effects.
- Use the simplest working solution.

---

## 8. Refactoring Guidelines

- Refactor only after tests pass.
- Apply one refactoring at a time.
- Run tests after each step.
- Prioritize removing duplication and improving clarity.

---

## 9. Example Workflow

1. Write a failing test for a small part of the feature.
2. Implement bare minimum to pass.
3. Run all tests (Green).
4. Apply necessary structural changes (Tidy First).
5. Commit structural changes separately.
6. Add next failing test.
7. Repeat until feature complete.

---

## 10. TypeScript / JavaScript Specific Rules

- Prefer functional style (pure functions, immutability).
- Use TypeScript types/interfaces for explicit dependencies.
- Favor combinators (`map`, `reduce`, `filter`) over loops.
- Handle async with `async/await` and proper error handling.
- Keep modules small, focused, and clearly separated.
- Avoid mixing structural and behavioral changes in a single commit.

---

## 11. Agent Workflow Notes

- Always process one test at a time.
- Implement just enough code for test to pass.
- Run all tests after each step.
- Maintain separate commits for structural vs. behavioral changes.
