---
task: create-analyst-report
description: Combine problem, success, and impact analysis into comprehensive report
category: analysis

contract:
  inputs:
    problem_statement:
      type: file
      description: Problem statement document
      required: true
    success_criteria:
      type: file
      description: Success criteria document
      required: true
    impact_map:
      type: file
      description: Impact analysis document
      required: true
  outputs:
    analyst_report:
      type: file
      description: Comprehensive analyst report for PM handoff
      required: true

template: templates/analyst-report-tmpl.md
---

# Task: Create Analyst Report

## Purpose

Combine Problem, Success, and Impact into one deliverable.

## Steps

1. Write a concise **1-page executive summary**.
2. Merge all key findings clearly.
3. List **top risks, assumptions, open issues**.
4. End with **3–5 recommended next steps**.

## Output Format

Use the provided template to create a comprehensive report with:
- Executive summary (1 page)
- Consolidated key findings
- Top risks, assumptions, and open issues
- 3-5 recommended next steps for PM
