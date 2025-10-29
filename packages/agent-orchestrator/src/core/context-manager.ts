import { FileManager } from '../utils/file-manager.js';
import type { ContextUpdate } from '../types/index.js';

export class ContextManager {
  constructor(private fileManager: FileManager) {}

  /**
   * Initialize a new shared context file for a workflow
   */
  async initializeContext(
    contextPath: string,
    options: {
      workflowName: string;
      featureId: string;
      title: string;
      prompt?: string;
      userContext?: Record<string, string | string[]>;
    }
  ): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];

    const content = `# Workflow Context: ${options.workflowName} - ${options.featureId}

**Generated**: ${timestamp}
**Status**: In Progress

---

## Feature Overview

- **Feature ID**: ${options.featureId}
- **Title**: ${options.title}
- **Workflow**: ${options.workflowName}
- **Started**: ${timestamp}

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
`;

    await this.fileManager.writeFile(contextPath, content);
  }

  /**
   * Update shared context with agent's context_update block
   */
  async updateContext(
    contextPath: string,
    update: ContextUpdate,
    personaName: string
  ): Promise<void> {
    const content = await this.fileManager.readFile(contextPath);
    const timestamp = new Date().toISOString().split('T')[0];

    let updatedContent = content;

    // Update Terminology section
    if (update.new_terminology && update.new_terminology.length > 0) {
      updatedContent = this.updateTerminologySection(updatedContent, update.new_terminology);
    }

    // Update Key Metrics section
    if (update.metrics && update.metrics.length > 0) {
      updatedContent = this.updateMetricsSection(updatedContent, update.metrics);
    }

    // Update Stakeholder Decisions section
    if (update.decisions && update.decisions.length > 0) {
      updatedContent = this.updateDecisionsSection(
        updatedContent,
        update.decisions,
        personaName,
        timestamp
      );
    }

    // Update Critical Files section
    if (update.critical_files && update.critical_files.length > 0) {
      updatedContent = this.updateCriticalFilesSection(updatedContent, update.critical_files);
    }

    await this.fileManager.writeFile(contextPath, updatedContent);
  }

  /**
   * Append execution log entry
   */
  async appendExecutionLog(
    contextPath: string,
    entry: {
      persona: string;
      behaviorId: string;
      output?: string;
      status: 'completed' | 'failed';
      duration: number;
      keyFindings?: string[];
      error?: string;
    }
  ): Promise<void> {
    const content = await this.fileManager.readFile(contextPath);

    const logEntry = `
### ${entry.persona} Phase - ${entry.behaviorId}

- **Output**: ${entry.output || 'N/A'}
- **Status**: ${entry.status === 'completed' ? '✅' : '❌'} ${entry.status === 'completed' ? 'Complete' : 'Failed'}
- **Duration**: ${(entry.duration / 1000).toFixed(1)}s${entry.error ? `\n- **Error**: ${entry.error}` : ''}${
      entry.keyFindings && entry.keyFindings.length > 0
        ? `\n- **Key Findings**:\n${entry.keyFindings.map((f) => `  - ${f}`).join('\n')}`
        : ''
    }
`;

    // Find the Execution Log section and append
    const logSectionRegex = /(## Execution Log\s*\n(?:.*?\n)*?)(\n##|\n*$)/s;
    const updatedContent = content.replace(logSectionRegex, (match, section, rest) => {
      return section + logEntry + rest;
    });

    await this.fileManager.writeFile(contextPath, updatedContent);
  }

  private updateTerminologySection(content: string, terms: Array<{ term: string; definition: string }>): string {
    const section = terms.map((t) => `- **${t.term}**: ${t.definition}`).join('\n');

    const regex = /(## Terminology[^\n]*\n\n)(?:.*?)(\n---)/s;
    return content.replace(regex, `$1${section}$2`);
  }

  private updateMetricsSection(
    content: string,
    metrics: Array<{ name: string; value: string; baseline?: string }>
  ): string {
    const hasBaseline = metrics.some((m) => m.baseline);

    let section: string;
    if (hasBaseline) {
      section = `| Metric | Baseline | Target |\n|--------|----------|--------|\n`;
      section += metrics.map((m) => `| ${m.name} | ${m.baseline || 'N/A'} | ${m.value} |`).join('\n');
    } else {
      section = metrics.map((m) => `- **${m.name}**: ${m.value}`).join('\n');
    }

    const regex = /(## Key Metrics\s*\n\n)(?:.*?)(\n---)/s;
    return content.replace(regex, `$1${section}$2`);
  }

  private updateDecisionsSection(
    content: string,
    decisions: Array<{ id: string; text: string }>,
    personaName: string,
    timestamp: string
  ): string {
    const section = decisions
      .map((d) => `- **${d.id}**: ${d.text} (Decided by: ${personaName}, Date: ${timestamp})`)
      .join('\n');

    const regex = /(## Stakeholder Decisions[^\n]*\n\n)(?:.*?)(\n---)/s;

    // Check if there's already content
    const match = content.match(regex);
    if (match && match[0].includes('Format:')) {
      // Replace placeholder
      return content.replace(regex, `$1${section}$2`);
    } else {
      // Append to existing content
      return content.replace(regex, (fullMatch, header, footer) => {
        const existing = fullMatch.replace(header, '').replace(footer, '').trim();
        return header + (existing ? existing + '\n' + section : section) + footer;
      });
    }
  }

  private updateCriticalFilesSection(content: string, files: string[]): string {
    const section = files.map((f) => `- \`${f}\``).join('\n');

    const regex = /(## Critical Files\s*\n\n)(?:.*?)(\n---)/s;

    // Check if there's already content
    const match = content.match(regex);
    if (match && match[0].includes('Files that are central')) {
      // Replace placeholder
      return content.replace(regex, `$1${section}$2`);
    } else {
      // Append to existing content
      return content.replace(regex, (fullMatch, header, footer) => {
        const existing = fullMatch.replace(header, '').replace(footer, '').trim();
        const existingFiles = existing
          .split('\n')
          .filter((l) => l.trim())
          .map((l) => l.replace(/^- `(.+)`$/, '$1'));
        const allFiles = [...new Set([...existingFiles, ...files])];
        return header + allFiles.map((f) => `- \`${f}\``).join('\n') + footer;
      });
    }
  }
}
