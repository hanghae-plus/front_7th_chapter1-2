---
task: create-implementation-plan
description: Create stepwise implementation plan for development team
category: architecture

contract:
  inputs:
    pm_summary:
      type: file
      description: PM summary report
      required: true
    system_overview:
      type: file
      description: System design overview (if exists)
      required: false
    api_design:
      type: file
      description: API design document (if exists)
      required: false
  outputs:
    implementation_plan:
      type: file
      description: Detailed implementation plan with tasks and dependencies
      required: true

template: templates/architecture/implementation-plan.tmpl.md
---

# Task: Create Implementation Plan

## Purpose

Outline stepwise implementation plan for development team.

## Steps

1. Break down the feature into **phases and modules**.
2. Define **task dependencies** (parallel vs sequential).
3. Estimate **effort, complexity, and risk** per module.
4. Include **testing checkpoints** and **integration milestones**.

## Output Format

Use the provided template to create implementation plan with:
- Feature breakdown into phases and modules
- Task dependencies and execution order
- Effort estimates and complexity assessment
- Testing checkpoints and integration milestones
- Risk mitigation strategies
