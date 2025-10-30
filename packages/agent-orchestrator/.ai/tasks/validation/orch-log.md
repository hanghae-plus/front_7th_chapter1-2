---
task: orch-log
description: Orchestration evaluation, quality gate checks, and GO/NO-GO verdict
category: validation

contract:
  inputs:
    quality_gates:
      type: file
      description: Quality gate definitions
      required: true
      multiple: true
    recent_outputs:
      type: file
      description: Recent workflow outputs to evaluate
      required: true
      multiple: true
  outputs:
    orchestration_log:
      type: file
      description: Evaluation results with GO/NO-GO verdict and next actions
      required: true

template: templates/orchestration/execution-log.tmpl.md
---

# Task: Orchestration Evaluation & Log

## Purpose

Evaluate quality gates, recent outputs, and provide GO/NO-GO verdict with explicit next actions.

## Steps

1. **Read Quality Gates**:
   - Coverage thresholds
   - Performance targets
   - Accessibility requirements
   - Lint/typecheck standards

2. **Check Thresholds**:
   - Compare actual vs. expected values
   - Identify any violations
   - Assess severity of violations

3. **Evaluate Recent Outputs**:
   - Review generated documents
   - Check completeness
   - Verify quality

4. **Produce Verdict**:
   - **GO**: All gates passed, proceed
   - **NO-GO**: Violations found, specify which phase to return to

5. **Define Next Actions**:
   - 2-3 numbered, explicit next steps
   - Clear guidance for operator

## Output Format

Use the provided template to create orchestration log with:
- Quality gate evaluation table (gate/threshold/actual/status)
- Violations list (if any)
- GO/NO-GO verdict with rationale
- Explicit next actions (numbered list)
- Recommended phase to return to (if NO-GO)
