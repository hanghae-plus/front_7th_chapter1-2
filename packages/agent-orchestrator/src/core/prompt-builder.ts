import type { PersonaDefinition, BehaviorDefinition } from '../types/index.js';

export interface PromptBuildOptions {
  persona: PersonaDefinition;
  behavior?: BehaviorDefinition;
  context?: string;
  inputs?: Array<{ name: string; content: string }>;
  featureId?: string;
  title?: string;
  taskContent?: string;
  templateContent?: string;
}

export class PromptBuilder {
  /**
   * Build a complete prompt for an agent
   */
  build(options: PromptBuildOptions): string {
    const sections: string[] = [];

    // 1. Persona Identity
    sections.push(this.buildPersonaSection(options.persona));

    // 2. Shared Context (if provided)
    if (options.context) {
      sections.push(this.buildContextSection(options.context));
    }

    // 3. Task Instructions (if behavior is specified)
    if (options.behavior && options.taskContent) {
      sections.push(this.buildTaskSection(options.taskContent));
    }

    // 4. Template (if provided)
    if (options.templateContent) {
      sections.push(this.buildTemplateSection(options.templateContent));
    }

    // 5. Input Files
    if (options.inputs && options.inputs.length > 0) {
      sections.push(this.buildInputsSection(options.inputs));
    }

    // 6. Execution Requirements
    if (options.behavior || options.featureId) {
      sections.push(
        this.buildExecutionSection(options.featureId, options.title, options.behavior)
      );
    }

    return sections.join('\n\n---\n\n');
  }

  private buildPersonaSection(persona: PersonaDefinition): string {
    const corePrinciples = persona.persona.core_principles || [];

    return `# PERSONA IDENTITY

${persona.agent.description || 'AI Agent'}

You are ${persona.agent.name}, a ${persona.persona.role || 'assistant'}.

**Style**: ${persona.persona.style || 'Professional'}
**Identity**: ${persona.persona.identity || 'Helpful AI'}
**Focus**: ${persona.persona.focus || 'Task completion'}

**Core Principles**:
${corePrinciples.length > 0 ? corePrinciples.map((p) => `- ${p}`).join('\n') : '- Be helpful and accurate'}`;
  }

  private buildContextSection(context: string): string {
    return `# SHARED CONTEXT (READ FIRST!)

${context}

⚠️ IMPORTANT:
- Use the exact terminology defined in context
- Respect all stakeholder decisions (DECISION-NNN entries)
- Consider cross-cutting concerns (security, performance, compatibility)
- Add your key findings to the execution log`;
  }

  private buildTaskSection(taskContent: string): string {
    return `# YOUR TASK

${taskContent}`;
  }

  private buildTemplateSection(templateContent: string): string {
    return `# TEMPLATE

${templateContent}`;
  }

  private buildInputsSection(inputs: Array<{ name: string; content: string }>): string {
    const inputSections = inputs.map(
      (input) => `## ${input.name}

${input.content}`
    );

    return `# INPUT FILES

${inputSections.join('\n\n---\n\n')}`;
  }

  private buildExecutionSection(
    featureId?: string,
    title?: string,
    behavior?: BehaviorDefinition
  ): string {
    let section = `# EXECUTION REQUIREMENTS\n`;

    if (featureId) {
      section += `\n**Feature ID**: ${featureId}`;
    }
    if (title) {
      section += `\n**Title**: ${title}`;
    }
    if (behavior?.output) {
      section += `\n**Output File**: ${behavior.output}`;
    }

    section += `\n\n## Validation Checklist

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
    - id: "DECISION-NNN"
      text: "Description of decision"

  critical_files:
    - "path/to/file.ts"

  metrics:
    - name: "Metric Name"
      value: "Value with unit"
      baseline: "Baseline value (if applicable)"
\`\`\`

This structured data will be extracted and merged into the shared context file.`;

    return section;
  }
}
