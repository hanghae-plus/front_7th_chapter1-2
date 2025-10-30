---
task: create-pm-summary
description: Summarize product goals, roadmap, and acceptance criteria for handoff
category: planning

contract:
  inputs:
    product_goals:
      type: file
      description: Product goals document
      required: true
    roadmap:
      type: file
      description: Product roadmap document (if exists)
      required: false
    acceptance_criteria:
      type: file
      description: Acceptance criteria document
      required: true
  outputs:
    pm_summary:
      type: file
      description: Comprehensive PM summary for Architect & QA handoff
      required: true

template: templates/planning/summary.tmpl.md
---

# Task: Create PM Summary Report

## Purpose

Summarize product goals, roadmap, and acceptance criteria.

## Steps

1. Summarize **background, objectives, and scope**.
2. Highlight **roadmap focus, risks, dependencies**.
3. Include **acceptance summary table**.
4. Conclude with **next actions & decision points**.

## Output Format

Use the provided template to create PM summary with:
- Background, objectives, and scope
- Roadmap highlights and key milestones
- Risks and dependencies
- Acceptance criteria summary table
- Next actions and decision points for Architect & QA
