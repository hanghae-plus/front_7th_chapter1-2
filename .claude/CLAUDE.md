# Project Configuration & Agent Guidelines

## Core Philosophy

**Less is More**: Conversations are ephemeral, decisions are permanent.

**Principles**:

1. Minimize file creation - favor updating over creating
2. Organize by feature/topic, not by time
3. Keep living documents that evolve
4. Only workflow outputs get minimal reports
5. Ad-hoc work stays in conversation unless explicitly saved

---

## Directory Structure

```
project-root/
├── .ai-output/
│   ├── features/{feature-name}/
│   │   ├── README.md           # Living document (continuously updated)
│   │   ├── decisions.md        # Key decisions with context
│   │   ├── implementation.md   # Implementation notes
│   │   └── tests.md            # Test plan and strategy
│   │
│   ├── workflows/
│   │   └── {YYYYMMDD_HHMMSS}_{workflow-name}_{feature-name}.md
│   │
│   └── decisions/
│       └── NNNN-title.md       # Architecture Decision Records (ADRs)
│
├── .claude/
│   ├── agents/                 # Agent persona definitions
│   └── workflows/              # Workflow orchestration definitions
│
└── src/                        # Source code
```

---

## Output Rules

### 🤖 Ad-hoc Agent Conversations

**Default**: NO file creation

```
User: "분석해줘"
Agent: [분석 내용을 대화로 응답] ✅
       [파일 생성 안 함] ✅
```

**File Creation**: Only with explicit keywords

- "문서화해줘"
- "README 만들어줘"
- "파일로 저장해줘"
- "ADR 작성해줘"

**Anti-patterns**:

```
❌ "분석 결과를 파일로 저장했습니다"
❌ 자동으로 파일 생성
✅ 대화로 답변
✅ 명시적 키워드로만 파일 생성
```

---

## Agent-Specific Guidelines

### All Agents (Ad-hoc)

```python
def respond(query):
    answer = analyze(query)
    return answer  # In conversation
    # DO NOT create files unless explicit keyword
```

**Explicit Keywords for File Creation**:

- "문서화해줘"
- "README 만들어줘"
- "파일로 저장해줘"
- "ADR 작성해줘"

### Dev / QA / Refactor Agents

**Pre-flight Check (MANDATORY)**:

```bash
# Step 1: Check Node version
node -v

# Step 2: If not v22.x.x, switch immediately
nvm use 22

# Step 3: Verify again
node -v  # Must output v22.x.x

# Step 4: Now safe to run tests
npm test
```

**DO NOT skip this check**. Tests will fail on Node.js versions other than 22.x.

### Workflow Orchestrator

**Responsibilities**:

1. Execute workflow steps
2. Create **minimal** workflow report
3. Coordinate feature documents
4. Summary only - no verbose logs

**Report Template**:

```markdown
# {Workflow Name}: {feature-name}

**Executed**: {timestamp}
**Duration**: {duration}
**Status**: {status}

## Outputs

[List of created/updated files]

## Next Steps

[2-3 actionable items]
```

---

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 22.x ⚠️ **REQUIRED for testing**
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Build**: Vite

### ⚠️ Testing Pre-requisite

**CRITICAL**: Before running ANY test command, ensure Node.js 22 is active:

```bash
nvm use 22
node -v  # Must show: v22.x.x
```

**Why**: Tests fail on other Node versions due to dependency incompatibilities (e.g., icu4c library issues).

**All agents (dev, qa, refactor, etc.) MUST verify Node version before executing tests.**

### Coding Standards

- Prefer pure functions
- Immutable data
- Small functions (<50 lines)
- Descriptive names over comments
- Test business logic

---

## Git Conventions

**Branches**: `feature/{feature-name}`, `fix/{bug-name}`

**Commits**:

```
feat(auth): implement OAuth login

- Add Auth0 integration
- Create session management
```

**Format**: `type(scope): description`

---

## File Creation Decision Tree

```
User request received
│
├─ Contains explicit keyword? ("문서화", "README 만들어", "저장", "ADR")
│  └─ YES → Ask where to save → Create file
│  └─ NO → Continue to next check
│
├─ Workflow execution?
│  └─ YES → Create minimal report + feature docs
│  └─ NO → Continue to next check
│
└─ Default: Respond in conversation, NO file creation
```
