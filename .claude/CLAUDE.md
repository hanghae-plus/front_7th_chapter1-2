# Project Configuration & Agent Guidelines

## Output File Management

### Agent Output Location Guidelines

**IMPORTANT**: All agents must follow these strict file output conventions to maintain project organization and traceability.

#### Analysis & Report Documents

All analysis reports, review documents, and intermediate artifacts that are **NOT explicitly requested by the user** or **do not have a specified output path** MUST be created in:

```
.ai/reports/
```

#### Report File Naming Convention

Use the following naming pattern for all reports:

```
YYYY-MM-DD_HH-MM_{agent-name}_{report-type}_{brief-description}.md
```

**Components:**
- `YYYY-MM-DD_HH-MM`: Timestamp when the report was generated (24-hour format)
- `{agent-name}`: Name of the agent that created the document (analyst, architect, qa, dev, refactor, pm, etc.)
- `{report-type}`: Type of document (analysis, review, report, plan, summary, etc.)
- `{brief-description}`: 2-4 word human-readable description (use hyphens, lowercase)

**Examples:**
```
.ai/reports/2025-10-31_14-30_analyst_analysis_user-auth-requirements.md
.ai/reports/2025-10-31_15-45_architect_review_api-design-assessment.md
.ai/reports/2025-10-31_16-20_qa_report_test-coverage-gaps.md
.ai/reports/2025-10-31_17-00_dev_summary_implementation-blockers.md
.ai/reports/2025-10-31_18-15_refactor_plan_code-quality-improvements.md
```

#### Report Document Header

Every report MUST include this metadata header at the top:

```markdown
---
generated_by: {agent-name}
generated_at: YYYY-MM-DD HH:MM:SS
report_type: {type}
related_feature: {feature-id or N/A}
purpose: {brief description of why this document was created}
---

# {Report Title}
```

**Example:**
```markdown
---
generated_by: analyst
generated_at: 2025-10-31 14:30:00
report_type: problem-analysis
related_feature: F-123
purpose: Analyze user authentication requirements for login feature
---

# Problem Analysis: User Authentication Requirements
```

### Explicit Output Paths

When a user **explicitly specifies** an output path or the task definition includes a designated output location, use that path instead of `.ai/reports/`.

**Examples:**
- User says: "Write the analysis to `docs/requirements.md`" → Use `docs/requirements.md`
- Task file specifies: `output: .ai/features/F-123/analysis.md` → Use that path
- Workflow defines output location → Follow workflow specification

### Deliverable vs. Intermediate Artifacts

**Deliverables** (requested by user or required by workflow):
- Place in the location specified by the user/workflow
- Examples: feature specifications, API documentation, architectural decision records (ADRs)

**Intermediate Artifacts** (analysis, reviews, internal reports):
- Place in `.ai/reports/` with proper naming convention
- Examples: code review notes, impact assessments, internal analysis documents

### Agent-Specific Guidelines

#### Analyst
- Problem statements, impact analyses, requirement analyses → `.ai/reports/`
- UNLESS: User specifies location like `.ai/features/{id}/01_problem.md`

#### Architect
- Design reviews, architecture assessments, trade-off analyses → `.ai/reports/`
- UNLESS: Creating ADRs or formal architectural documents requested by user

#### QA
- Test coverage reports, quality gate reports, test result summaries → `.ai/reports/`
- UNLESS: Creating formal test plans in feature directories

#### Dev
- Implementation summaries, blocker reports, technical notes → `.ai/reports/`
- Code changes go in actual source files (not reports)

#### Refactor
- Refactoring plans, code quality reports, technical debt analyses → `.ai/reports/`
- Actual refactored code goes in source files

#### PM
- Roadmap drafts, prioritization analyses, product reviews → `.ai/reports/`
- UNLESS: Creating official product documents requested by user

#### Orchestrator
- Workflow execution summaries, coordination reports → `.ai/reports/`

### Directory Structure

```
project-root/
├── .ai/
│   ├── reports/                          # All intermediate reports
│   │   ├── YYYY-MM-DD_HH-MM_agent_type_description.md
│   │   └── ...
│   ├── features/                         # Explicit feature artifacts
│   │   └── F-{id}/
│   │       ├── 01_problem.md             # Deliverables go here
│   │       ├── 02_requirements.md
│   │       └── ...
│   └── memory/                           # Workflow state/memory
├── .claude/
│   ├── agents/                           # Agent persona definitions
│   └── workflows/                        # Workflow orchestration definitions
└── src/                                  # Source code
```

### Report Retention Policy

- Keep reports for **30 days** by default
- Archive or delete old reports periodically
- Critical reports should be promoted to proper documentation locations

### Quality Standards for Reports

All reports in `.ai/reports/` must:

1. **Include metadata header** with generator info
2. **Use clear markdown formatting** with proper headers
3. **Include timestamp** in both filename and header
4. **State purpose explicitly** in the header
5. **Use consistent terminology** aligned with project
6. **Link to related artifacts** when applicable
7. **Be self-contained** (readable without external context)

---

## Project Context

### Technology Stack

- **Language**: TypeScript
- **Framework**: React (if applicable)
- **Build Tool**: Vite/Webpack (check package.json)
- **Testing**: Vitest/Jest (check configuration)
- **Package Manager**: pnpm

### Project Structure

```
.claude/agents/          # Agent persona definitions
packages/                # Monorepo packages
├── agent-orchestrator/  # Multi-agent workflow system
└── ...
```

### Coding Standards

- Use TypeScript strict mode
- Follow functional programming patterns where appropriate
- Write tests for business logic
- Use descriptive variable and function names
- Comment complex logic, not obvious code

### Workflow Patterns

#### Manual Agent Invocation
When working ad-hoc without workflows, follow this sequence:
1. **Analyst** frames the problem and requirements
2. **PM** defines product goals and acceptance criteria
3. **Architect** designs the solution architecture
4. **QA** creates test plan and quality gates
5. **Dev** implements with TDD approach
6. **Refactor** improves code quality

#### Automated Workflow Orchestration
For structured, repeatable processes, use workflows defined in `.claude/workflows/`:

**TDD Setup Workflow** (`/workflow tdd_setup`):
- Orchestrates Analyst → PM → Architect → QA phases automatically
- Creates complete feature documentation in `.ai/features/{feature-id}/`
- Generates failing test suite (RED phase) ready for implementation
- Ensures consistent outputs and quality gates at each step
- Duration: ~15-20 minutes

See `.claude/workflows/README.md` for complete workflow documentation.

### Git Conventions

- Branch naming: `feature/`, `fix/`, `refactor/`, etc.
- Commit messages: Clear, descriptive, imperative mood
- PR descriptions: Include context, changes, testing notes

---

## Important Reminders

### For All Agents

1. **Always follow the output location guidelines** above
2. **Never create unrequested markdown files** in project root or src directories
3. **Use `.ai/reports/`** for all intermediate analysis and review documents
4. **Include metadata headers** in all generated reports
5. **Use human-readable filenames** with timestamps
6. **Document who created what and when** in every artifact
7. **Ask for clarification** if output location is ambiguous
8. **Prefer consolidating information** over creating many small files

### Output Decision Tree

```
Is this a report/analysis/review?
  └─ Yes
      └─ Did user specify output path?
          └─ Yes → Use specified path
          └─ No → Use .ai/reports/YYYY-MM-DD_HH-MM_{agent}_{type}_{desc}.md

Is this source code?
  └─ Yes → Place in appropriate src/ directory

Is this a deliverable (spec, doc, ADR)?
  └─ Yes
      └─ Did user/workflow specify path?
          └─ Yes → Use specified path
          └─ No → Ask user for preferred location
```

---

## Quality Gates

All agents should verify:
- [ ] Output file is in correct location
- [ ] Filename follows naming convention
- [ ] Metadata header is present and complete
- [ ] Content is well-structured and clear
- [ ] Related artifacts are linked
- [ ] Purpose is explicitly stated

---

**Version**: 1.0
**Last Updated**: 2025-10-31
**Maintained By**: context-engineer
