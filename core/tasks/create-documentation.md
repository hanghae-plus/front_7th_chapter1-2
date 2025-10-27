<!-- Powered by BMAD™ Core -->

# Create Documentation Task

## Purpose

To create comprehensive, clear, and actionable documentation that helps developers understand and use the codebase.

## Documentation Types

### 1. README

**Purpose**: Project overview and quick start
**Audience**: New developers, users, contributors

**Sections**:

```markdown
# Project Name

Brief description (1-2 sentences)

## 🚀 Features

- Feature 1
- Feature 2

## 📋 Requirements

- Node.js 18+
- pnpm

## ⚡ Quick Start

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## 📖 Documentation

- [API Docs](./docs/api.md)
- [Testing Guide](./docs/testing.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)
```

### 2. Test Documentation

**Purpose**: Explain test strategy and how to run tests
**Audience**: Developers writing/maintaining tests

**Sections**:

```markdown
# Testing Guide

## Overview

This project uses [Vitest] for unit/integration tests.

## Test Structure

\`\`\`
src/**tests**/
├── unit/ # Unit tests
├── integration/ # Integration tests
└── e2e/ # E2E tests
\`\`\`

## Running Tests

\`\`\`bash
pnpm test # Run all
pnpm test:unit # Unit only
pnpm test:coverage # With coverage
\`\`\`

## Writing Tests

[Patterns and examples...]
```

### 3. API Documentation

**Purpose**: Document public APIs
**Audience**: API consumers

**Format**:

````typescript
/**
 * Calculates the total price including tax
 *
 * @param items - Array of price items
 * @param taxRate - Tax rate as decimal (0.1 for 10%)
 * @returns Total price with tax
 *
 * @example
 * ```typescript
 * calculateTotalWithTax([10, 20], 0.1) // Returns 33
 * ```
 */
export function calculateTotalWithTax(items: number[], taxRate: number): number;
````

## Process

### 1. Analyze Target

- Identify documentation type needed
- Determine target audience
- Review existing docs (if any)
- Check code for inline comments

### 2. Content Planning

- Define key sections
- Prioritize by importance
- List examples needed
- Identify diagrams/code samples

### 3. Write Documentation

- Start with overview
- Add concrete examples
- Include code samples
- Provide troubleshooting section
- Add links to related docs

### 4. Review & Improve

- Check for clarity
- Verify examples work
- Ensure completeness
- Update existing docs to match

## Best Practices

### DO:

✅ Start with "why" before "how"
✅ Use real examples from codebase
✅ Keep examples up-to-date
✅ Provide copy-paste ready code
✅ Use consistent formatting
✅ Add diagrams for complex concepts
✅ Include troubleshooting section
✅ Link to related resources

### DON'T:

❌ Assume prior knowledge
❌ Use jargon without explanation
❌ Include outdated information
❌ Write walls of text
❌ Skip error handling examples
❌ Forget to test examples
❌ Use placeholder values without note

## Templates

### README Template

```markdown
# [Project Name]

[One-sentence description]

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)

## Features

- Feature 1
- Feature 2

## Requirements

- Node.js X.X+
- pnpm X.X+

## Installation

\`\`\`bash
pnpm install
\`\`\`

## Usage

\`\`\`typescript
import { Example } from './lib';

const example = new Example();
example.run();
\`\`\`

## Documentation

- [API Docs](./docs/api.md)
- [Testing Guide](./docs/testing.md)
- [Contributing](./CONTRIBUTING.md)

## License

MIT
```

## Output

Create documentation files:

- Main README at project root
- Component-specific docs in `docs/`
- Inline JSDoc comments in code
- Architecture docs for complex systems

## Verification

- [ ] Documentation is complete
- [ ] Examples are tested and working
- [ ] Links are valid
- [ ] Formatting is consistent
- [ ] Content is up-to-date
- [ ] Examples match current code
- [ ] Troubleshooting section included
- [ ] Clear navigation structure

```

```
