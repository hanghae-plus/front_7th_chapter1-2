---
task: generate-refactor-patches
description: Generate safe, incremental refactoring patches with rationale
category: validation

contract:
  inputs:
    source_code:
      type: file
      description: Source code to refactor
      required: true
    verification_report:
      type: file
      description: Verification report from implementation phase
      required: false
    additional_files:
      type: text
      description: Comma-separated list of additional files to consider
      required: false
  outputs:
    refactor_patches:
      type: file
      description: Refactoring patches with diff blocks and rationale
      required: true

template: templates/validation/refactor-patches.tmpl.md
---

# Task: Generate Refactor Patches (REFACTOR Phase)

## Purpose

Produce safe, incremental refactoring patches to improve code quality.

## Steps

1. **Identify Code Smells**:
   - Long methods or functions
   - Duplicated code
   - Complex conditionals
   - Poor naming
   - Tight coupling

2. **Propose Small Patches**:
   - One refactoring per patch
   - Include diff blocks (before/after)
   - Provide clear rationale
   - Note expected risk level

3. **Maintain Equivalence**:
   - Do not change public contracts
   - Preserve existing behavior
   - Keep tests passing

4. **Document Rollback**:
   - How to undo each patch
   - Risk mitigation strategy

## Output Format

Use the provided template to create refactor patches with:
- Code smell analysis
- Patch-by-patch refactorings (diff blocks)
- Rationale for each change
- Risk level (low/medium/high)
- Rollback instructions
