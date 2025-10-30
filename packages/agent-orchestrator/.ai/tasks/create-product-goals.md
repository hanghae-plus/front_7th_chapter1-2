---
task: create-product-goals
description: Translate analysis into product objectives and outcome KPIs
category: planning

contract:
  inputs:
    analyst_report:
      type: file
      description: Comprehensive analyst report
      required: true
  outputs:
    product_goals:
      type: file
      description: Product goals with KPIs and success narrative
      required: true

template: templates/pm-product-goals-tmpl.md
---

# Task: Define Product Goals

## Purpose

Translate analysis into product objectives.

## Steps

1. Connect **business objectives** ↔ **user value**.
2. Define 3–5 product goals with **Outcome KPIs**.
3. Write a **success narrative** (Before/After story in 5–7 lines).
4. Document **timeline, resources, and guardrails**.

## Output Format

Use the provided template to create product goals with:
- Business objectives aligned with user value
- 3-5 product goals with measurable outcome KPIs
- Success narrative (Before/After story)
- Timeline, resource requirements, and guardrails
