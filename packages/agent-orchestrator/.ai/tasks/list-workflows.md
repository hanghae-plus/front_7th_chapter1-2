# Task: List Workflows

## Purpose

Display all available workflows in `.ai/workflows/` directory with their details.

## Inputs

None (scans `.ai/workflows/` directory)

## Steps

1. Scan `.ai/workflows/` directory for `*.yaml` files
2. For each workflow file:
   - Parse YAML structure
   - Extract workflow name
   - Count steps
   - Identify unique personas
3. Format as table
4. Display usage examples

## Output

Terminal output (formatted table)

**Format:**

```
🎼 Available Workflows

┌──────────────┬────────────────────────┬───────┬──────────────────────┐
│ Name         │ Description            │ Steps │ Personas             │
├──────────────┼────────────────────────┼───────┼──────────────────────┤
│ tdd_setup    │ Complete TDD setup...  │ 13    │ analyst → pm → qa    │
│ tdd_cycle    │ TDD development cycle  │ 7     │ qa → dev → refactor  │
└──────────────┴────────────────────────┴───────┴──────────────────────┘

Usage:
  /workflow run <name> <feature-id> [title]

Examples:
  /workflow run tdd_setup F-123 "Date Filter Optimization"
  /workflow run tdd_cycle F-123
```

## Notes

- Use Glob tool to find workflow files
- Use Read tool to parse each YAML
- Format output with clear alignment
- Include usage examples for clarity
