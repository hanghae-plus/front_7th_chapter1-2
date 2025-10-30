---
task: create-acceptance-criteria
description: Define measurable and testable acceptance conditions
category: planning

contract:
  inputs:
    product_goals:
      type: file
      description: Product goals document (optional, can use roadmap directly)
      required: false
    roadmap:
      type: file
      description: Product roadmap document
      required: false
    analyst_report:
      type: file
      description: Analyst report for context
      required: false
  outputs:
    acceptance_criteria:
      type: file
      description: Acceptance criteria with user stories and test conditions
      required: true

template: templates/planning/acceptance-criteria.tmpl.md
---

# Task: Create Acceptance Criteria

## Purpose

Define measurable and testable acceptance conditions.

## Steps

1. Write **user stories (Role/Action/Value)** + **AC** in Given/When/Then.
2. Include at least **2 edge or negative cases**.
3. Add non-functional metrics: performance, accessibility, security.
4. Build a **traceability matrix (Goal ↔ AC)**.

## Output Format

Use the provided template to create acceptance criteria with:
- User stories in standard format (As a/I want/So that)
- Acceptance criteria in Given/When/Then format
- Edge cases and negative scenarios
- Non-functional requirements (performance, a11y, security)
- Traceability matrix linking goals to criteria
