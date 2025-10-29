import YAML from 'yaml';
import type { ContextUpdate } from '../types/index.js';

export interface ParsedResult {
  output: string;
  contextUpdate?: ContextUpdate;
  outputFiles: string[];
}

export class ResultParser {
  /**
   * Extract YAML context_update block from agent output
   */
  extractContextUpdate(output: string): ContextUpdate | undefined {
    // Look for ```yaml block with context_update
    const yamlBlockRegex = /```yaml\s*\n([\s\S]*?)\n```/g;
    const matches = Array.from(output.matchAll(yamlBlockRegex));

    for (const match of matches) {
      try {
        const parsed = YAML.parse(match[1]);
        if (parsed && parsed.context_update) {
          return parsed.context_update as ContextUpdate;
        }
      } catch (error) {
        console.warn('Failed to parse YAML block:', error);
      }
    }

    return undefined;
  }

  /**
   * Extract file paths mentioned in the output
   * Looks for patterns like "saved to `path/to/file.md`"
   */
  extractOutputFiles(output: string): string[] {
    const files: string[] = [];

    // Pattern 1: "saved to `path/to/file.md`"
    const pattern1 = /saved to [`']([^`']+)[`']/gi;
    const matches1 = Array.from(output.matchAll(pattern1));
    matches1.forEach((m) => files.push(m[1]));

    // Pattern 2: "created: path/to/file.md"
    const pattern2 = /created:?\s+([^\s]+\.md)/gi;
    const matches2 = Array.from(output.matchAll(pattern2));
    matches2.forEach((m) => files.push(m[1]));

    // Pattern 3: mentioned in context_update output field
    const contextUpdate = this.extractContextUpdate(output);
    if (contextUpdate?.critical_files) {
      files.push(...contextUpdate.critical_files);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Parse agent result and extract structured data
   */
  parse(output: string): ParsedResult {
    return {
      output,
      contextUpdate: this.extractContextUpdate(output),
      outputFiles: this.extractOutputFiles(output),
    };
  }

  /**
   * Validate that context update has required structure
   */
  validateContextUpdate(update: ContextUpdate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if at least one field is present
    const hasAnyField =
      update.key_findings ||
      update.new_terminology ||
      update.decisions ||
      update.critical_files ||
      update.metrics;

    if (!hasAnyField) {
      errors.push('Context update must have at least one field');
    }

    // Validate terminology structure
    if (update.new_terminology) {
      for (const term of update.new_terminology) {
        if (!term.term || !term.definition) {
          errors.push('Terminology must have both term and definition');
        }
      }
    }

    // Validate decisions structure
    if (update.decisions) {
      for (const decision of update.decisions) {
        if (!decision.id || !decision.text) {
          errors.push('Decision must have both id and text');
        }
        if (decision.id && !decision.id.match(/^DECISION-\d{3}$/)) {
          errors.push(`Invalid decision ID format: ${decision.id} (should be DECISION-NNN)`);
        }
      }
    }

    // Validate metrics structure
    if (update.metrics) {
      for (const metric of update.metrics) {
        if (!metric.name || !metric.value) {
          errors.push('Metric must have both name and value');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
