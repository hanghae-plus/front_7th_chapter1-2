---
task: create-success-criteria
description: Define measurable success indicators and acceptance boundaries
category: analysis

contract:
  inputs:
    problem_statement:
      type: file
      description: Problem statement from previous analysis
      required: true
  outputs:
    success_criteria:
      type: file
      description: Measurable success criteria document
      required: true

template: templates/analyst-success-criteria-tmpl.md
---

# Task: Create Success Criteria (SMART)

## Purpose

Make success measurable and verifiable.

## Steps

1. Define 3–5 goals following **SMART** (Specific, Measurable, Achievable, Relevant, Time-bound).
2. Add **measurement methods, data sources, and observation window** for each.
3. List **failure conditions or guardrails**.
4. Create a **metrics table** (Current vs Target).

## Output Format

Use the provided template to create SMART success criteria with:
- 3-5 SMART goals with clear metrics
- Measurement methods and data sources
- Failure conditions and guardrails
- Current vs. Target metrics table
