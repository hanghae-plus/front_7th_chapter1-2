# Tasks Directory

This directory contains all task definitions for the agent orchestration system.

## 📁 Directory Structure

Tasks are organized by category for efficient discovery and management:

```
tasks/
├── analysis/          # Analyst persona tasks (4 tasks)
│   ├── create-problem-statement.md
│   ├── create-success-criteria.md
│   ├── create-impact-map.md
│   └── create-analyst-report.md
│
├── planning/          # PM persona tasks (4 tasks)
│   ├── create-product-goals.md
│   ├── create-roadmap.md
│   ├── create-acceptance-criteria.md
│   └── create-pm-summary.md
│
├── architecture/      # Architect persona tasks (4 tasks)
│   ├── create-system-overview.md
│   ├── create-api-design.md
│   ├── create-system-diagram.md
│   └── create-implementation-plan.md
│
├── implementation/    # Dev persona tasks (2 tasks)
│   ├── implement-feature.md
│   └── verify-implementation.md
│
├── testing/           # QA persona tasks (3 tasks)
│   ├── write-test-code.md
│   ├── create-test-plan.md
│   └── create-quality-gate.md
│
├── validation/        # Refactor + validation tasks (5 tasks)
│   ├── check-quality-gates.md
│   ├── run-tests.md
│   ├── refactor-patches.md
│   ├── refactor-verify.md
│   └── orch-log.md
│
└── orchestration/     # Orchestrator persona tasks (2 tasks)
    ├── list-workflows.md
    └── run-workflow.md
```

**Total: 24 tasks across 7 categories**

## 🎯 Task Structure

Each task file follows this format:

```yaml
---
task: task-name
description: Brief description of what this task does
category: category-name

contract:
  inputs:
    input_name:
      type: file|text
      description: What this input represents
      required: true|false
  outputs:
    output_name:
      type: file|text
      description: What this output produces
      required: true|false

template: templates/category/template-name.tmpl.md
---

# Task: Task Name

(Task implementation details)
```

## 🔍 Task Registry

Tasks are loaded efficiently using the **TaskRegistry** system:

```typescript
// O(1) lookup after initial indexing
const taskPath = await taskRegistry.getTaskFilePath('create-problem-statement');
// Returns: ".ai/tasks/analysis/create-problem-statement.md"
```

### How It Works

1. **Lazy Initialization**: Registry is built on first task access
2. **Category Scanning**: Scans all 7 category directories
3. **Name Mapping**: Maps task names to their category paths
4. **Cached Lookups**: Subsequent lookups are O(1)

### Benefits

- ✅ **Efficient**: O(1) lookups after initialization
- ✅ **No Workflow Changes**: Tasks referenced by name only
- ✅ **Scalable**: Easy to add new categories
- ✅ **Maintainable**: Clear organization

## 📝 Naming Convention

Task files follow the pattern: `{verb}-{noun}.md`

- `create-problem-statement.md` ✅
- `write-test-code.md` ✅
- `verify-implementation.md` ✅
- `check-quality-gates.md` ✅

## 🔗 Usage in Workflows

Workflows reference tasks by name only (no category path):

```yaml
steps:
  - persona: analyst
    task: create-problem-statement  # ← Just the task name
    bindings:
      inputs:
        user_request: "{{prompt}}"
      outputs:
        problem_statement: ".ai/output/feature/{{featureId}}/problem.md"
```

The TaskRegistry automatically resolves the category path at runtime.

## 📊 Category Guidelines

### When to Create a Task

- **Reusable Logic**: Can be used by multiple workflows
- **Clear Contract**: Well-defined inputs and outputs
- **Single Responsibility**: Does one thing well
- **Persona-Neutral**: Not tightly coupled to one persona

### Choosing a Category

| Category | Purpose | Example Tasks |
|----------|---------|---------------|
| `analysis` | Problem analysis, requirements gathering | create-problem-statement, create-impact-map |
| `planning` | Product planning, goal setting | create-product-goals, create-roadmap |
| `architecture` | System design, technical planning | create-system-overview, create-api-design |
| `implementation` | Code writing, feature development | implement-feature, verify-implementation |
| `testing` | Test creation, QA activities | write-test-code, create-test-plan |
| `validation` | Quality checks, refactoring | check-quality-gates, refactor-patches |
| `orchestration` | Workflow management, meta-tasks | list-workflows, run-workflow |

## 🚀 Adding a New Task

1. **Choose Category**: Determine which category fits best
2. **Create File**: `tasks/{category}/{task-name}.md`
3. **Define Contract**: Specify inputs/outputs with types
4. **Set Category Field**: Match the directory category
5. **Reference Template**: Link to appropriate template
6. **Update Persona**: Add task to persona's capability list

Example:

```bash
# Create new task
cat > tasks/analysis/create-user-research.md << 'EOF'
---
task: create-user-research
description: Conduct user research and create insights report
category: analysis

contract:
  inputs:
    research_questions:
      type: file
      description: Research questions to investigate
      required: true
  outputs:
    research_report:
      type: file
      description: User research findings and insights
      required: true

template: templates/analysis/user-research.tmpl.md
---

# Task: Create User Research

(Implementation details...)
EOF

# Task is automatically discovered by TaskRegistry!
```

## 🔧 Maintenance

### Clear Registry Cache

If you add/remove tasks during development:

```typescript
taskRegistry.clearCache();
```

### List All Tasks

```typescript
const allTasks = await taskRegistry.getAllTaskNames();
console.log(allTasks);
```

### Get Tasks by Category

```typescript
const analysisTasks = await taskRegistry.getTasksByCategory('analysis');
console.log(analysisTasks);
```

## 📚 Related Documentation

- [Templates](../templates/README.md) - Output templates for tasks
- [Personas](../personas/README.md) - Persona capabilities
- [Workflows](../workflows/README.md) - Workflow composition
- [Architecture Guide](../../docs/ARCHITECTURE.md) - System design
