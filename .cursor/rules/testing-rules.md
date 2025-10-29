# Testing Rules (Good Tests Guide)

This document defines how AI (and humans) should write tests for this project.  
Follow the TDD loop: **RED → GREEN → REFACTOR**.

---

## 0) Purpose

- Provide a safety net to prevent regressions while evolving features
- Execute the TDD cycle quickly and reliably
- Serve as an executable spec that teammates/agents can reproduce and verify

---

## 1) Core Principles

1. **One behavior per test**

   - A single test should verify one user/system behavior and its outcome.

2. **Assert observable outcomes only**

   - Verify externally observable results: DOM changes, return values, call counts, state transitions.

3. **AAA structure (Arrange–Act–Assert)**

   - **Arrange**: set up fixtures/initial state
   - **Act**: perform the behavior (once)
   - **Assert**: check the expected outcome

4. **RED first**

   - Start with a meaningful failing test, then pass it with the minimal implementation.

5. **Deterministic & isolated**

   - No order dependence or shared global state between tests.
   - Fix or mock timers, random, time, and network.

6. **Include boundaries & negatives**

   - Cover min/max/empty/dup/permission failures, etc.

7. **Use domain language**
   - Prefer domain terms in test names, descriptions, and fixtures so requirements read naturally.

---

## 2) Naming Conventions

- **File**: `<target>.<action>.spec.ts(x)` or `*.spec.ts` per unit
- **Test title**: `should <behavior/result> when <condition>`
  - e.g., `should create only on 31st when monthly recurrence is selected`

Structure example:

```ts
describe('[function or feature name]', () => {
  it('should [expected behavior] when [situation]', () => {
    // Arrange–Act–Assert
  });
});
```

## 3) TDD Operations & Commits

1. RED: write a failing unit/integration test and confirm the failure
2. GREEN: implement the smallest change to pass
3. REFACTOR: remove duplication and improve clarity (tests stay green)
4. Commits (separate for each step):
   • test(red): ...
   • feat(green): ...
   • refactor: ...

## 4) Test Levels

    •	Unit: pure functions/hooks/utils; remove external dependencies; fast and precise
    •	Integration: hook + component + state wiring; represent user flows and requirements
    •	E2E (optional): key scenarios; for this assignment, integration tests can sufficiently cover flows

## 5) React/Hook Testing Conventions

    •	Use React Testing Library: test from the user’s perspective (roles, labels, text), not implementation details
    •	Use userEvent for interactions; for async rendering, use findBy*/waitFor
    •	Test hooks via component wrappers or a custom render utility

## 6) Mocking / Stubs

    •	Treat external systems as test doubles: API/time/random/storage
    •	Network: use MSW for contract-level mocking; for pure units, allow function-level mocks
    •	Time: prefer vi.useFakeTimers() or inject a fixed Date.now; fix the reference clock for recurrence logic
    •	Random/IDs: seed or inject the generator
    •	Avoid over-mocking: domain logic should be composed “for real” in integration tests

## 7) Fixtures & Data Builders

    •	Prepare minimal inputs; use named builders/helpers to remove duplication
    •	No shared mutable state across tests; each test should be self-contained

## 8) Assertion Quality

    •	Aim for one clear assertion per test (or a small group for one outcome)
    •	Negative paths should assert thrown errors/messages explicitly (toThrow, message match)
    •	Prefer getByRole / getByLabelText / getByText for DOM queries

## 9) Coverage Philosophy

    •	Focus on risk & complexity: branch-heavy code, domain rules, high-regression areas
    •	Treat coverage as a result, not as the target

## 10) Assignment-Specific Checklist (Recurring Schedules)

    •	Recurrence types: Daily / Weekly / Monthly / Yearly
    •	Monthly 31st: generate only on the 31st (do not substitute with 30/28/29)
    •	Yearly Feb 29: generate only in leap years
    •	Overlaps allowed (do not de-duplicate by design)
    •	Calendar view: show an icon for recurring events; no icon for single (detached) events
    •	End condition: stop at the given end date (max: 2025-12-31)
    •	Edit
    •	Single occurrence: convert that instance to a single event (remove icon)
    •	Edit all: keep recurrence (keep icon)
    •	Delete
    •	Single occurrence: remove only that instance
    •	Delete all: remove every occurrence

## 11) Recommended Test Suite (Examples)

Utilities / Domain
• generateRecurrences
• Monthly 31st rule
• Yearly Feb 29 rule (leap years only)
• Weekly day alignment across month/year boundaries
• End date clamped at 2025-12-31

Hooks / State
• Create / edit / delete flows (single vs all)
• After single edit, icon disappears; after edit all, icon remains

UI Integration
• Calendar renders recurrence icons distinctly
• User interactions update view/state correctly

## 12) Quality Gates

    •	Full test run should be fast (seconds) and stable locally
    •	Flaky tests are not allowed (remove timing races, eliminate time-dependence)
    •	Every new feature follows RED → GREEN → REFACTOR with commit history

## 13) Commit Message Templates

    •	test(red): monthly 31st occurs only on 31st
    •	feat(green): implement 31st-only monthly generation
    •	refactor: extract recurrence generator and clarify names

##14) Example Test Snippet

```ts
describe('generateRecurrences', () => {
  it('should create events on Feb 29 only in leap years when yearly', () => {
    // Arrange
    const start = new Date('2024-02-29'); // leap year
    const end = new Date('2030-12-31');

    // Act
    const events = generateRecurrences({ start, end, type: 'yearly' });

    // Assert
    const dates = events.map((e) => e.date);
    expect(dates).toContain('2028-02-29');
    expect(dates).not.toContain('2025-02-28'); // do NOT substitute
  });
});
```

## 15) AI Writing Notes

When generating tests:
• Prefer behavioral descriptions over technical internals
• Add short comments documenting the intent of the test
• Include edge cases automatically for date/time logic
• Keep fixtures minimal and meaningful
• Avoid long, hard-coded datasets unless necessary
