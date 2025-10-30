---
task: create-impact-map
description: Visualize impact areas, dependencies, and risks across domains
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
  outputs:
    impact_map:
      type: file
      description: Impact analysis and risk assessment document
      required: true

template: templates/analysis/impact-map.tmpl.md
---

# Task: Create Impact Map

## Purpose

Visualize impact areas, dependencies, and risks.

## Steps

1. Map key domains: **UX / API / Performance / Security / Cost / Maintainability**.
2. For each domain, describe **impacts, risks, and mitigation**.
3. List **dependencies** (internal/external teams, services, data pipelines).
4. Create a **risk register** with priority, severity, and mitigation plan.

## Output Format

Use the provided template to create an impact map with:
- Domain-specific impact analysis (UX, API, Performance, etc.)
- Risk assessment for each domain
- Dependency mapping (teams, services, data)
- Risk register with priorities and mitigation plans
