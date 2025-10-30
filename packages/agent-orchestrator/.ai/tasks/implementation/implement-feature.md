---
task: implement-feature
description: Implement minimal code to make failing tests pass (GREEN phase)
category: implementation

contract:
  inputs:
    test_code:
      type: file
      description: Test file with failing tests that define expected behavior
      required: true
    requirements:
      type: file
      description: Acceptance criteria or requirements document
      required: false
    implementation_context:
      type: text
      description: Implementation constraints or patterns to follow
      required: false
  outputs:
    source_code:
      type: file
      description: Implementation file that makes tests pass
      required: true

template: templates/implementation/implementation.tmpl.md
---

# Task: Implement Minimal Code (GREEN)

## Objective

Write the **simplest code** that makes the failing tests pass. Follow TDD principles:
- ✅ Make tests green
- ❌ Don't optimize yet (that's for REFACTOR phase)
- ✅ Keep it simple and readable

## Guidelines

### 1. Read the Test Code

- Understand what behavior the tests expect
- Identify all test cases that need to pass
- Note any edge cases or error handling

### 2. Write Minimal Implementation

- Start with the simplest solution
- Focus on making tests pass, not perfection
- Avoid premature optimization
- Use clear, descriptive names

### 3. Follow Constraints

If `implementation_context` is provided:
- Respect coding patterns (functional, OOP, etc.)
- Follow existing project conventions
- Use specified libraries or frameworks

### 4. Document Your Changes

In the output, include:
- What files were created/modified
- Key implementation decisions
- Any assumptions made
- Areas that may need refactoring later

## Output Format

Use the provided template (`templates/implementation/implementation.tmpl.md`) to structure your output.

Include:
1. **File Changes**: List of files created/modified
2. **Implementation**: The actual code
3. **Rationale**: Why this approach was chosen
4. **Test Status**: Confirmation that tests pass
5. **Notes**: Any technical debt or areas for improvement

## TDD Reminder

Remember: This is the **GREEN** phase.
- Goal: Make tests pass
- Not Goal: Perfect code (that's for REFACTOR)

Keep it simple. Make it work. Refine it later.
