---
task: check-quality-gates
description: Verify quality gates and provide TDD cycle summary
category: validation

contract:
  inputs:
    test_code:
      type: file
      description: Test code file
      required: true
    source_code:
      type: file
      description: Implementation source code
      required: true
    verification_report:
      type: file
      description: Verification report from dev
      required: true
    equivalence_report:
      type: file
      description: Refactor equivalence report (optional)
      required: false
  outputs:
    quality_report:
      type: file
      description: Quality gate check results and TDD summary
      required: true

template: templates/qa-quality-gate-check-tmpl.md
---

# Task: Check Quality Gates

## Purpose

Verify that all quality gates are met and provide comprehensive TDD cycle summary.

## Steps

1. **Run Quality Checks**:
   - Execute tests and verify all pass
   - Check code coverage meets thresholds
   - Run linting and type checking
   - Verify code complexity within limits

2. **Validate TDD Cycle**:
   - ✅ RED: Tests were written first and initially failed
   - ✅ GREEN: All tests now pass
   - ✅ REFACTOR: Code quality improved (if applicable)

3. **Generate Metrics**:
   - Test coverage percentage
   - Number of tests (unit/integration/e2e)
   - Code quality scores
   - Performance benchmarks (if applicable)

4. **Create Summary**:
   - Pass/Fail verdict for each quality gate
   - Overall TDD cycle status
   - Recommendations for next steps

## Output Format

Use the provided template to create quality report with:
- Quality gate results (Pass/Fail for each gate)
- Test execution summary (all tests, coverage)
- Code quality metrics (lint, typecheck, complexity)
- TDD cycle validation (RED → GREEN → REFACTOR)
- Overall verdict and recommendations
