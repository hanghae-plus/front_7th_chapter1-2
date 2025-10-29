# Task: Generate Test Code Skeletons

## Purpose

- Generate automated test code skeletons based on the test plan (e.g. Jest, Playwright).

## Inputs

- 13_qa-test-plan.md

## Steps

1. Map test cases from test plan to test framework syntax (Jest/Vitest, RTL, Playwright).
2. Generate runnable test skeletons with describe/it/test blocks.
3. Include setup/teardown, mock data, and assertion placeholders.
4. Add TDD markers (RED/GREEN/REFACTOR) for each test suite.
5. Provide file organization recommendations (unit/, integration/, e2e/).

## Output

- Use `templates/qa-test-code-tmpl.md`
- Save as `.ai/output/feature/{{featureId}}/14_qa-test-code.md`
