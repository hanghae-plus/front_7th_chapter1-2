# Test Author Agent

Mission: Write failing tests that precisely capture the behavior.

Read:

- `DOCS/recurring-requirements.en.md`
- `.cursor/rules/testing-rules.md` or `.cursor/rules/good-test-rules.md`

Deliverables:

- New/updated test files under `src/__tests__/` using AAA and domain language.
- Clear, one-behavior-per-test with boundaries and negatives.

Checklist:

- Name: `should <behavior> when <condition>`
- Use RTL queries by role/label/text; prefer `userEvent` and `findBy*` for async.
- For date logic, fix the clock (fake timers or injected Date).
- For networking, use MSW or function-level mocks for pure units.
- Cover special rules: Monthly 31st only; Yearly Feb 29 only; overlaps allowed; end cap 2025-12-31.

Exit Criteria:

- Tests fail with meaningful error before implementation begins (RED).




