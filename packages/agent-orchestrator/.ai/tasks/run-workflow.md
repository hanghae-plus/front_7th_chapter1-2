---
task: run-workflow
description: Execute complete multi-agent workflow with context management
category: orchestration

contract:
  inputs:
    workflow_definition:
      type: file
      description: Workflow YAML definition file
      required: true
    feature_id:
      type: text
      description: Feature identifier for this execution
      required: true
    title:
      type: text
      description: Feature title (optional)
      required: false
    user_context:
      type: text
      description: Additional user-provided context (optional)
      required: false
  outputs:
    execution_state:
      type: file
      description: Workflow execution state JSON
      required: true
    shared_context:
      type: file
      description: Shared context markdown file
      required: true
    workflow_summary:
      type: file
      description: Workflow execution summary
      required: true

template: null
---

# Task: Run Workflow

## Purpose

Execute a complete multi-agent workflow by coordinating persona agents, managing shared context, and validating outputs at each step.

## Inputs

- `workflows/{{workflowName}}.yaml` - Workflow definition
- User arguments: `featureId`, `title` (optional)

## Steps

### 1. Parse Workflow Definition

- Read `.ai/workflows/{{workflowName}}.yaml`
- Extract: workflow name, steps array
- Validate structure (has name, steps)
- Count total steps for progress reporting

### 2. Initialize Shared Context

Create `.ai/workflows/context/{{workflowName}}_{{featureId}}_context.md` with:

```markdown
# Workflow Context: {{workflowName}} - {{featureId}}

**Generated**: {{timestamp}}
**Status**: In Progress

---

## Feature Overview

- **Feature ID**: {{featureId}}
- **Title**: {{title}}
- **Workflow**: {{workflowName}}
- **Started**: {{timestamp}}

---

## Terminology (All agents MUST use these exact terms)

*To be populated by agents during execution*

---

## Key Metrics

*To be populated by agents*

---

## Stakeholder Decisions (Immutable once set)

*Format: DECISION-NNN: [Decision text] (Decided by: [Persona], Date: [Timestamp])*

---

## Critical Files

*Files that are central to this feature*

---

## Cross-Cutting Concerns

### Security
*Security considerations*

### Performance
*Performance targets and constraints*

### Compatibility
*Browser/platform compatibility requirements*

---

## Execution Log

*Updated by Orchestrator after each step*
```

### 3. Execute Each Step via Task Tool

For each step in workflow.steps:

#### a. Report Progress
```
[{{currentStep}}/{{totalSteps}}] Executing {{persona}}.{{stepId}}...
```

#### b. Load Persona Definition
- Read `.ai/personas/{{step.persona}}.md`
- Parse YAML block
- Extract behavior: `behavior.{{step.id}}`

#### c. Collect Input Files
- For each path in `behavior.inputs`:
  - Resolve variables ({{featureId}}, etc.)
  - Read file content
  - If file missing and required, check for prerequisite step

#### d. Read Shared Context
- Read current `.ai/workflows/context/{{workflowName}}_{{featureId}}_context.md`

#### e. Build Agent Prompt

Construct prompt for Task tool:

```markdown
# PERSONA IDENTITY

{{persona.agent.description}}

You are {{persona.agent.name}}, a {{persona.persona.role}}.

Style: {{persona.persona.style}}
Identity: {{persona.persona.identity}}
Focus: {{persona.persona.focus}}

Core Principles:
{{#each persona.persona.core_principles}}
- {{this}}
{{/each}}

---

# SHARED CONTEXT (READ FIRST!)

{{contextFileContent}}

⚠️ IMPORTANT:
- Use the exact terminology defined in context
- Respect all stakeholder decisions (DECISION-NNN entries)
- Consider cross-cutting concerns (security, performance, compatibility)
- Add your key findings to the execution log

---

# YOUR TASK

{{taskInstructions}}  // from behavior.load.tasks

---

# TEMPLATE

{{templateContent}}  // from behavior.load.templates

---

# INPUT FILES

{{#each inputFiles}}
## {{this.name}}

{{this.content}}

---
{{/each}}

---

# EXECUTION REQUIREMENTS

**Feature ID**: {{featureId}}
**Title**: {{title}}
**Output File**: {{behavior.output}}

## Validation Checklist

Before submitting your output:
- [ ] Use exact terminology from shared context
- [ ] Reference key findings from previous phases (check execution log)
- [ ] Include all required sections from template
- [ ] No placeholder text ({{...}}, TODO, TBD)
- [ ] File size > 100 bytes

## After Completing Output

⚠️ **CRITICAL**: After writing your document, provide a YAML block for context update.

Format:

\`\`\`yaml
context_update:
  key_findings:
    - "First important finding or decision"
    - "Second important finding or decision"

  new_terminology:
    - term: "Term Name"
      definition: "Clear definition in 1-2 sentences"

  decisions:
    - id: "DECISION-001"
      text: "Description of decision"

  critical_files:
    - "path/to/file.ts"

  metrics:
    - name: "Metric Name"
      value: "Value with unit"
      baseline: "Baseline value (if applicable)"
\`\`\`

**Example:**

\`\`\`yaml
context_update:
  key_findings:
    - "Identified 3 filter passes as root cause (150-200ms total)"
    - "Target performance: <50ms p95 latency for 1000 events"

  new_terminology:
    - term: "Single-pass filtering"
      definition: "Combine search + date filtering in one iteration (O(2N) → O(N))"
    - term: "Date caching"
      definition: "Map<string, Date> to avoid repeated Date object allocations"

  decisions:
    - id: "DECISION-001"
      text: "Zero breaking changes allowed (all 301 existing tests must pass)"

  critical_files:
    - "src/utils/eventUtils.ts"
    - "src/utils/dateUtils.ts"

  metrics:
    - name: "Filter Time (1000 events)"
      value: "<50ms"
      baseline: "150-200ms"
\`\`\`

This structured data will be extracted and merged into the shared context file.
```

#### f. Execute Task

```javascript
// Use Task tool with general-purpose agent
await Task({
  subagent_type: "general-purpose",
  description: `${step.persona} ${step.id} for ${featureId}`,
  prompt: [built prompt from step e]
})
```

#### g. Validate Output

Check:
- [ ] File exists at `behavior.output` path
- [ ] File size > 100 bytes (not empty)
- [ ] Contains required sections from template
- [ ] No unresolved placeholders ({{variable}})

If validation fails:
- Retry step once
- If still fails, prompt user for action

#### h. Update Shared Context

**Extract YAML block from agent response:**

1. Search for ````yaml` block with `context_update:` key in agent's output
2. Parse YAML to extract structured data:
   - `key_findings` (array of strings)
   - `new_terminology` (array of {term, definition})
   - `decisions` (array of {id, text})
   - `critical_files` (array of strings)
   - `metrics` (array of {name, value, baseline})

3. Read current context file: `.ai/workflows/context/{{workflowName}}_{{featureId}}_context.md`

4. **Update context sections:**

   **Terminology section:**
   ```markdown
   ## Terminology

   - **Single-pass filtering**: Combine search + date filtering in one iteration (O(2N) → O(N))
   - **Date caching**: Map<string, Date> to avoid repeated Date object allocations
   ```

   **Decisions section:**
   ```markdown
   ## Stakeholder Decisions

   - **DECISION-001**: Zero breaking changes allowed (Decided by: PM, Date: 2025-10-28)
   ```

   **Metrics section:**
   ```markdown
   ## Key Metrics

   | Metric | Baseline | Target |
   |--------|----------|--------|
   | Filter Time (1000 events) | 150-200ms | <50ms |
   ```

   **Critical Files section:**
   ```markdown
   ## Critical Files

   - `src/utils/eventUtils.ts` - Primary optimization target
   - `src/utils/dateUtils.ts` - Date range logic
   ```

   **Execution Log section (append):**
   ```markdown
   ### {{Persona}} Phase - {{step.id}}

   - **Output**: {{behavior.output}} ({{fileSize}})
   - **Status**: ✅ Complete
   - **Duration**: {{stepDuration}}s
   - **Key Findings**:
     - {{finding1}}
     - {{finding2}}
   ```

5. Write updated context file back to disk

**If YAML block not found:**
- Log warning: "⚠️ Agent did not provide context_update block"
- Still append to execution log with minimal info (just output path + status)

#### i. Report Step Complete

```
✅ [{{currentStep}}/{{totalSteps}}] {{persona}}.{{stepId}} complete
   Output: {{outputPath}} ({{fileSize}})
   Duration: {{stepDuration}}s
```

### 4. Generate Execution Summary

After all steps complete, create summary document similar to F-123's `00_TDD_SETUP_SUMMARY.md`:

**Include**:
- Workflow overview
- All generated documents with sizes
- Key findings from each phase
- Metrics and targets (from context)
- Next steps
- Success criteria checklist

### 5. Save Execution State

Create `.ai/workflows/state/{{workflowName}}_{{featureId}}_execution.json`:

```json
{
  "workflow": "{{workflowName}}",
  "featureId": "{{featureId}}",
  "title": "{{title}}",
  "status": "completed",
  "startedAt": "{{timestamp}}",
  "completedAt": "{{timestamp}}",
  "duration": "{{duration}}s",
  "steps": [
    {
      "persona": "analyst",
      "id": "analyze",
      "status": "completed",
      "output": ".ai/output/feature/F-123/01_problem.md",
      "duration": "5s"
    },
    ...
  ]
}
```

### 6. Report Final Completion

```
🎉 Workflow {{workflowName}} complete!

📁 Generated Documents: {{count}}
   {{#each documents}}
   - {{this.path}} ({{this.size}})
   {{/each}}

📊 Execution Summary: {{summaryPath}}
⏱️  Total Duration: {{totalDuration}}

✅ All {{totalSteps}} steps passed validation

📌 Shared Context: {{contextPath}}

Next Steps:
{{suggestedCommands}}
```

## Error Handling

### Step Execution Failure

If a step fails after 3 retries:

```
❌ Step {{persona}}.{{stepId}} failed after 3 retries

Error: {{errorMessage}}

Options:
1. Skip this step and continue
2. Abort workflow

What would you like to do?
```

Wait for user input before proceeding.

### Missing Input File

If required input file doesn't exist:

```
⚠️  Required input missing: {{inputPath}}

Checking workflow for prerequisite step...
```

- Search workflow for step that produces this output
- If found, execute that step first
- Then retry original step

### Validation Failure

If output validation fails:

```
❌ Output validation failed: {{reason}}

Regenerating step...
```

- Retry step once automatically
- If still fails, treat as step execution failure

## Output

- All documents specified in workflow steps
- Shared context: `.ai/workflows/context/{{workflowName}}_{{featureId}}_context.md`
- Execution state: `.ai/workflows/state/{{workflowName}}_{{featureId}}_execution.json`
- Summary: `.ai/output/feature/{{featureId}}/00_{{workflowName}}_SUMMARY.md`

## Notes

- **Task tool is your friend**: Each step should be executed as a separate Task
- **Context is critical**: Always pass shared context to each agent
- **Validate early**: Catch errors before moving to next step
- **Clear progress**: User should always know what's happening
- **State persistence**: Save execution state for potential resume
