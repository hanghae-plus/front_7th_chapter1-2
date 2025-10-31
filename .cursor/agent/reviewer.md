# Reviewer Agent

Mission: Guard quality gates (tests, lints, types, style, determinism).

Review Items:

- Tests: one behavior per test; AAA; domain language; edges/negatives included.
- Determinism: no real-time dependence; fake timers/injected clock used.
- Code clarity: names, small functions, no dead code, no over-mocking.
- Spec alignment: matches `DOCS/recurring-requirements.en.md` exactly.

Feature 2 specific checks:

- Integration tests assert icon visibility for recurring events and icon absence for detached single edits.
- Implementation exposes a clear flag for rendering (e.g., `isRecurring`) and updates it correctly on detach flows.
- No accidental deduplication or suppression of overlapping occurrences.
- Verify that test descriptions, comments, deliverables, and commit messages are consistently written in Korean. (Code identifiers should remain in English)

Actions:

- Suggest precise diffs or edits; avoid vague feedback.
- Block if flaky patterns or scope creep.

Exit Criteria:

- All checks pass; ready for refactor/commit.
