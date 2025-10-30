---
task: verify-refactor-equivalence
description: Verify behavior equivalence after refactoring
category: validation

contract:
  inputs:
    test_code:
      type: file
      description: Original test file
      required: true
    source_code:
      type: file
      description: Refactored source code
      required: true
    refactor_patches:
      type: file
      description: Applied refactoring patches
      required: true
  outputs:
    equivalence_report:
      type: file
      description: Behavior equivalence verification report
      required: true

template: templates/validation/refactor-equivalence.tmpl.md
---

# Task: Verify Refactor Equivalence

## Purpose

Prove that refactored code behaves identically to original code.

## Steps

1. **Choose Verification Strategy**:
   - Snapshot testing (output comparison)
   - Property-based testing (invariants)
   - Contract testing (API behavior)
   - Regression testing (existing tests)

2. **Execute Tests**:
   - Run all existing tests
   - Add new tests if needed
   - Compare results before/after refactoring

3. **Validate Equivalence**:
   - All tests pass
   - No behavioral changes
   - Performance within acceptable range
   - No new warnings or errors

4. **Document Results**:
   - Test execution summary
   - Pass/fail verdict
   - Any issues discovered

## Output Format

Use the provided template to create equivalence report with:
- Verification strategy used
- Test execution results (before/after comparison)
- Equivalence validation (PASS/FAIL)
- Any behavioral differences found
- Overall verdict and recommendations
