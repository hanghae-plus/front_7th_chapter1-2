---
task: create-system-overview
description: Define top-level system architecture overview
category: planning

contract:
  inputs:
    pm_summary:
      type: file
      description: PM summary report with goals and acceptance criteria
      required: true
  outputs:
    system_overview:
      type: file
      description: High-level system architecture document
      required: true

template: templates/architect-system-overview-tmpl.md
---

# Task: Create System Overview

## Purpose

Define the top-level system architecture overview.

## Steps

1. **Outline Architecture**:
   - Components and boundaries
   - Data flow diagrams
   - Integration points

2. **Define Quality Attributes**:
   - Scalability targets
   - Reliability requirements
   - Security considerations
   - Performance goals

3. **Describe Observability**:
   - Logging strategy
   - Metrics collection
   - Distributed tracing

4. **List Constraints**:
   - Technical constraints
   - Resource limitations
   - Trade-offs and decisions

## Output Format

Use the provided template to create system overview with:
- Component architecture (diagram and description)
- Data flow visualization
- Quality attributes matrix
- Observability strategy
- Constraints and trade-offs
- Technology stack decisions
