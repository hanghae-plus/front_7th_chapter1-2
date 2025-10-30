---
task: create-test-plan
description: Define test strategy, scope, and priorities for feature
category: testing

contract:
  inputs:
    acceptance_criteria:
      type: file
      description: PM acceptance criteria
      required: true
    implementation_plan:
      type: file
      description: Architect implementation plan
      required: true
  outputs:
    test_plan:
      type: file
      description: Comprehensive test plan with strategy and test cases
      required: true

template: templates/testing/test-plan.tmpl.md
---

# Task: Create QA Test Plan

## Purpose

Define test strategy, scope, and priorities.

## Steps

1. Map test types (Unit, Integration, E2E, Contract).
2. Define prioritization rules (risk-based).
3. List representative test cases with IDs, goals, and preconditions.
4. Specify tools, environments, and data strategy.

## Output Format

Use the provided template to create test plan with:
- Test type mapping (Unit/Integration/E2E/Contract)
- Risk-based prioritization strategy
- Representative test cases with IDs and preconditions
- Tools, environments, and test data strategy
- Quality gates and success criteria
