---
task: create-roadmap
description: Create milestone-based product roadmap with dependencies and risks
category: planning

contract:
  inputs:
    product_goals:
      type: file
      description: Product goals document
      required: true
  outputs:
    roadmap:
      type: file
      description: Milestone-based roadmap with dependencies and checkpoints
      required: true

template: templates/pm-roadmap-tmpl.md
---

# Task: Create Product Roadmap

## Purpose

Define milestones, dependencies, and execution plan.

## Steps

1. **Build Milestone Table**:
   - Goal / Output / Dependencies / Risks
   - Clear deliverables for each milestone

2. **Set Checkpoints**:
   - Mid-term indicators
   - Success validation points

3. **Assign Ownership**:
   - Owners and teams
   - Responsibility matrix

4. **Highlight Risks**:
   - High-risk items
   - Mitigation strategies
   - Alternative approaches

## Output Format

Use the provided template to create roadmap with:
- Milestone table (Goal/Output/Dependencies/Risks)
- Timeline with checkpoints
- Ownership assignments
- Risk register with mitigation plans
- Critical path identification
