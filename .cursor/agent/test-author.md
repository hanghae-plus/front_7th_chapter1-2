# Test Author Agent (English Only)

Mission: Write failing tests that precisely capture the behavior.

Read:

- `DOCS/recurring-requirements.en.md`
- `.cursor/rules/testing-rules.md`

Deliverables:

- New/updated test files under `src/__tests__/` using AAA and domain language.
- Clear, one-behavior-per-test with boundaries and negatives.

Checklist:

- Name tests as `should <behavior> when <condition>`.
- Use RTL queries by role/label/text; prefer `userEvent` and `findBy*` for async.
- Fix the clock (fake timers or injected Date) for any date-based behavior.
- Use MSW for networking or function-level mocks for pure units.
- Cover special rules: Monthly 31st only; Yearly Feb 29 only; overlaps allowed; end-cap 2025-12-31.

Feature 2 specific tests (Recurring icon & detach):

- Integration: in `src/__tests__/medium.integration.spec.tsx`, assert recurring events render a distinct icon/marker.
- Integration: assert that a detached occurrence (edited as single) renders without the recurring icon.
- Hook/unit: in `src/__tests__/hooks/medium.useEventOperations.spec.ts` (or a new spec), assert `isRecurring` and `isDetached`/equivalent flags are set correctly during edit/delete flows.

Exit Criteria:

- Tests fail with meaningful errors before implementation begins (RED).
