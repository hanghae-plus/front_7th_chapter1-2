---
task: run-tests
description: Execute tests and summarize results with failure analysis
category: validation

contract:
  inputs:
    test_code:
      type: file
      description: Test file to execute
      required: true
    source_code:
      type: file
      description: Source code being tested (for context)
      required: false
  outputs:
    test_results:
      type: file
      description: Test execution results and analysis
      required: true

template: templates/testing/test-results.tmpl.md
---

# Task: Run Tests & Summarize

## Purpose

Execute test suite and provide comprehensive results summary.

## Steps

1. **Execute Tests**:
   - Run appropriate test command (npm test, pytest, etc.)
   - Capture stdout/stderr
   - Record execution time

2. **Analyze Results**:
   - Count total/passed/failed tests
   - Identify failure patterns
   - Extract error messages

3. **Summarize**:
   - Create results table
   - Provide failure analysis
   - Suggest fixes if failures exist

4. **Determine Next Steps**:
   - If all pass: PROCEED to next phase
   - If failures: Return to RED/GREEN phase

## Output Format

Use the provided template to create test results with:
- Execution summary table (total/passed/failed/skipped)
- Detailed failure analysis (if any)
- Error messages and stack traces
- Suggested fixes or next actions
- GO/NO-GO verdict
