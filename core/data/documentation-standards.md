# Documentation Standards

## Writing Standards

### Clarity

- Write for someone new to the codebase
- Use simple, clear language
- Avoid jargon or explain it
- Break down complex concepts

### Completeness

- Document all public APIs
- Include examples
- Explain error cases
- Provide next steps

### Organization

- Start with overview
- Progress from simple to complex
- Use consistent structure
- Provide clear navigation

## README Standards

### Must Have

```markdown
- Project name and short description
- Quick start guide
- Installation instructions
- Basic usage example
- Links to detailed docs
```

### Should Have

```markdown
- Features list
- Requirements
- Testing instructions
- Contributing guidelines
- License information
```

### Nice to Have

```markdown
- Badges (build, coverage)
- Screenshots/demos
- Related projects
- Acknowledgments
```

## Code Comments Standards

### JSDoc for Functions

```typescript
/**
 * Calculates the total with tax
 *
 * @param subtotal - Pre-tax amount
 * @param rate - Tax rate (0.1 for 10%)
 * @returns Total with tax
 */
export function calculateTotal(subtotal: number, rate: number): number;
```

### Inline Comments

```typescript
// Only comment WHY, not WHAT
// Avoid obvious comments like "set variable to 5"

// Use BFS to handle dependencies
const queue = [rootNode];
```

## Documentation Structure

```
project/
├── README.md                    # Main README
├── docs/
│   ├── api/                     # API documentation
│   ├── guides/                  # How-to guides
│   ├── architecture/           # System design
│   └── testing/                # Test documentation
└── CONTRIBUTING.md             # Contribution guidelines
```

## Style Guide

### Headers

```markdown
# Main Title (one per file)

## Section

### Subsection

#### Detail
```

### Code Blocks

````markdown
```typescript
// Use proper language tags
const code = 'example';
```

```bash
# For shell commands
command --option
```
````

### Lists

```markdown
- Use bullet points for features
- Keep items parallel
- Use numbered lists for steps

1. First step
2. Second step
3. Third step
```

### Emphasis

```markdown
**Bold** for key terms
_Italic_ for emphasis
`code` for code/technical terms

> Blockquote for important notes
```

## Examples

### Good Example

```markdown
# MyLibrary

A powerful utility for processing data efficiently.

## Installation

\`\`\`bash
npm install mylibrary
\`\`\`

## Quick Start

\`\`\`typescript
import { processData } from 'mylibrary';

const result = processData([1, 2, 3]);
console.log(result); // [3, 2, 1]
\`\`\`

## Documentation

- [API Reference](./docs/api.md)
- [Contributing](./CONTRIBUTING.md)
```

### Bad Example

```markdown
# MyLibrary

some project i made

## Installation

npm install mylibrary

## Usage

it works
```

## Maintenance

### Keep Updated

- Update docs with code changes
- Test all examples regularly
- Review and improve periodically
- Fix broken links immediately

### Version Control

- Commit docs with code changes
- Don't commit generated docs
- Use meaningful commit messages
- Tag major doc updates

```

```
