---
task: create-quality-gate
description: Define measurable pass/fail thresholds for QA evaluation
category: testing

contract:
  inputs:
    test_plan:
      type: file
      description: QA test plan document
      required: true
    test_code:
      type: file
      description: Test code for reference (optional)
      required: false
  outputs:
    quality_gate:
      type: file
      description: Quality gate definition with thresholds and metrics
      required: true

template: templates/qa-quality-gate-tmpl.md
---

# Task: Create Quality Gate Definition

## Purpose

Define measurable pass/fail thresholds for QA evaluation.

## Steps

1. Specify minimum coverage (line/branch) & target paths.
2. Define performance, accessibility, and security thresholds.
3. Add lint/typecheck/complexity criteria.
4. Document measurement method & tools for each metric.

## Output Format

Use the provided template to create quality gate with:
- Coverage thresholds (line/branch coverage targets)
- Performance thresholds (response time, load time)
- Accessibility baseline (WCAG compliance level)
- Security requirements (vulnerability scan results)
- Code quality metrics (lint, typecheck, complexity)
