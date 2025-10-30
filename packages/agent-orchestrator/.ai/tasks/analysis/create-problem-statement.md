---
task: create-problem-statement
description: Convert vague request into measurable, structured problem definition
category: analysis

contract:
  inputs:
    user_request:
      type: text
      description: User's initial feature request or problem description
      required: true
    requirements:
      type: file
      description: Existing requirements or specification documents
      required: false
    existing_code:
      type: file
      description: Existing codebase for context
      required: false
      multiple: true
  outputs:
    problem_statement:
      type: file
      description: Structured problem definition document
      required: true

template: templates/analysis/problem-statement.tmpl.md
---

# Task: Create Problem Statement

## Purpose

Convert a vague request into a measurable, structured problem definition.

## Steps

1. Describe the **current vs desired** state in one sentence each.
2. Identify key **stakeholders, users, environment, and constraints**.
3. Form **top-3 hypotheses** about root causes and how to disprove them.
4. Explicitly define **scope IN / OUT**.
5. List all **unknowns** as concrete questions.

## Output Format

Use the provided template to create a structured problem statement with:
- Current state vs. Desired state
- Stakeholders and constraints
- Hypotheses and validation approach
- Scope boundaries (IN/OUT)
- List of unknowns
