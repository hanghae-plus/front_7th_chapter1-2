---
task: verify-implementation
description: Run tests and verify implementation correctness (GREEN phase validation)
category: implementation

contract:
  inputs:
    test_code:
      type: file
      description: Test file to execute
      required: true
    source_code:
      type: file
      description: Implementation source code to verify
      required: true
  outputs:
    verification_report:
      type: file
      description: Test execution results and verification report
      required: true

template: templates/dev-verification-tmpl.md
---

# Task: Verify Implementation

## Purpose

Run all tests and verify that implementation is correct and complete.

## Steps

1. **Execute Tests**:
   - Run all test suites
   - Verify all tests pass (GREEN phase)
   - Check for any warnings or errors

2. **Analyze Results**:
   - Test execution summary (total, passed, failed)
   - Coverage report (if available)
   - Execution time

3. **Validate Implementation**:
   - All acceptance criteria met
   - Edge cases handled correctly
   - Error handling in place

4. **Document Findings**:
   - Test results (pass/fail counts)
   - Any issues or concerns discovered
   - Recommendations for next steps

## Output Format

Use the provided template to create verification report with:
- Test execution summary (X tests passed, Y failed)
- Coverage metrics (if available)
- List of passed test scenarios
- Any failures or warnings (should be none in GREEN phase)
- Implementation validation checklist
- Overall verdict (PASS/FAIL)
