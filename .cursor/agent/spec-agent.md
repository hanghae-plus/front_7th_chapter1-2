# Agent Workflow Overview (English Only)

This repository uses six agents to implement the recurring features via TDD.
All agents must follow `.cursor/rules/testing-rules.md` and `DOCS/recurring-requirements.en.md`.

Agents:

1. Orchestrator
2. Test Author
3. Minimal Implementer
4. Refactorer
5. Reviewer
6. Committer

High-level flow (per feature slice):

- Orchestrator → Test Author (RED) → Minimal Implementer (GREEN) → Reviewer → Refactorer (REFACTOR) → Reviewer → Committer.

Artifacts and paths:

- Specs: `DOCS/recurring-requirements.en.md`
- Rules: `.cursor/rules/testing-rules.md`, `.cursor/rules/agent-rules.md`
- Tests: `src/__tests__/`
- Code: `src/`
