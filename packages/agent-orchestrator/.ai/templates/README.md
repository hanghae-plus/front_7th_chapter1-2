# Templates Directory

This directory contains all template files used by tasks in the agent orchestration system.

## 📁 Directory Structure

Templates are organized by category to match task categories:

```
templates/
├── analysis/          # Analyst persona templates
│   ├── problem-statement.tmpl.md
│   ├── success-criteria.tmpl.md
│   ├── impact-map.tmpl.md
│   └── report.tmpl.md
│
├── planning/          # PM persona templates
│   ├── product-goals.tmpl.md
│   ├── roadmap.tmpl.md
│   ├── acceptance-criteria.tmpl.md
│   ├── summary.tmpl.md
│   └── story.tmpl.md
│
├── architecture/      # Architect persona templates
│   ├── system-overview.tmpl.md
│   ├── api-design.tmpl.md
│   ├── system-diagram.tmpl.md
│   └── implementation-plan.tmpl.md
│
├── implementation/    # Dev persona templates
│   ├── implementation.tmpl.md
│   ├── verification.tmpl.md
│   └── guide.tmpl.md
│
├── testing/           # QA persona templates
│   ├── test-plan.tmpl.md
│   ├── test-code.tmpl.md
│   ├── test-code.ts.tpl
│   ├── quality-gate.tmpl.md
│   └── test-results.tmpl.md
│
├── validation/        # Refactor persona templates
│   ├── refactor-patches.tmpl.md
│   ├── refactor-equivalence.tmpl.md
│   └── refactor-checklist.tmpl.md
│
└── orchestration/     # Orchestrator persona templates
    └── execution-log.tmpl.md
```

## 🎯 Naming Convention

All template files follow the pattern: `{task-name}.tmpl.md`

- **Persona-neutral**: Templates are named after tasks, not personas
- **Category-based**: Organized by task category for easy discovery
- **Consistent suffix**: All templates end with `.tmpl.md`

## 📝 Template Variables

Standard variables available in all templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{featureId}}` | Feature identifier | `F-123` |
| `{{title}}` | Feature title | `"Date Filter Optimization"` |
| `{{persona}}` | Current persona | `analyst` |
| `{{task}}` | Current task | `create-problem-statement` |

## 🔗 Usage in Tasks

Tasks reference templates in their frontmatter:

```yaml
---
task: create-problem-statement
template: templates/analysis/problem-statement.tmpl.md
---
```

## ✨ Benefits of Categorization

1. **Easy Discovery**: Find templates by category
2. **Clear Organization**: Logical grouping matches task categories
3. **Scalability**: Easy to add new categories
4. **Maintainability**: Related templates grouped together
5. **Persona Independence**: Templates can be reused across personas

## 📚 Related Documentation

- [Task Definitions](../tasks/README.md) - Task contracts and definitions
- [Personas](../personas/README.md) - Persona capabilities
- [Workflows](../workflows/README.md) - Workflow composition
