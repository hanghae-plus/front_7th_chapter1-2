---
task: create-system-diagram
description: Visualize system modules, data flow, and dependencies
category: architecture

contract:
  inputs:
    api_design:
      type: file
      description: API design document
      required: true
    system_overview:
      type: file
      description: System overview (optional, for context)
      required: false
  outputs:
    system_diagram:
      type: file
      description: System diagram with visual representation
      required: true

template: templates/architecture/system-diagram.tmpl.md
---

# Task: Create System Diagram

## Purpose

Visualize modules, data flow, and dependencies.

## Steps

1. **Represent Architecture**:
   - Modules/services as nodes
   - Dependencies as edges
   - Storage components
   - External integrations

2. **Mark Flow Types**:
   - Synchronous flows
   - Asynchronous flows
   - Event-driven patterns
   - Failure points

3. **Use Diagram Tools**:
   - Mermaid (preferred for markdown)
   - PlantUML (alternative)
   - Include syntax in code block

4. **Add Textual Explanation**:
   - Describe each component
   - Explain data flows
   - Note critical paths

## Output Format

Use the provided template to create system diagram with:
- Mermaid/PlantUML diagram code
- Rendered diagram description
- Component explanations
- Data flow narrative
- Critical path identification
- Failure mode analysis
