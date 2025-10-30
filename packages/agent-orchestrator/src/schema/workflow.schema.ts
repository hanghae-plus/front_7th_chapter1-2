import { z } from 'zod';

/**
 * Workflow Schema Validation
 *
 * Validates workflow YAML files with context configuration.
 *
 * This file also re-exports persona types for convenience,
 * making it a central location for all schema-inferred types.
 */

// Re-export persona types for convenience
export type { PersonaConfig } from './persona.schema.js';

// Context prompt definition
export const ContextPromptSchema = z.object({
  key: z.string().min(1, 'Prompt key is required'),
  question: z.string().min(1, 'Question is required'),
  question_ko: z.string().optional(), // Korean translation
  type: z.enum(['file', 'text']).default('file'),
  required: z.boolean().default(false),
  examples: z.array(z.string()).optional(),
  default: z.string().optional(),
});

// Workflow context configuration
export const WorkflowContextConfigSchema = z.object({
  interactive: z.boolean(),
  prompts: z.array(ContextPromptSchema).optional(),
}).refine(
  (config) => {
    // If interactive, prompts should be provided
    if (config.interactive && (!config.prompts || config.prompts.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Interactive workflows should have at least one prompt',
  }
);

// Workflow bindings (maps contract fields to concrete values)
export const WorkflowBindingsSchema = z.object({
  inputs: z.record(z.union([z.string(), z.array(z.string())])).optional(),
  outputs: z.record(z.string()).optional(),
});

// Workflow step definition
export const WorkflowStepSchema = z.object({
  persona: z.string().min(1, 'Persona name is required'),
  task: z.string().min(1, 'Task name is required'),
  bindings: WorkflowBindingsSchema.optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

// Full workflow definition
export const WorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  context: WorkflowContextConfigSchema.optional(),
  steps: z.array(WorkflowStepSchema).min(1, 'Workflow must have at least one step'),
});

// Type exports
export type ContextPrompt = z.infer<typeof ContextPromptSchema>;
export type WorkflowContextConfig = z.infer<typeof WorkflowContextConfigSchema>;
export type WorkflowBindings = z.infer<typeof WorkflowBindingsSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowConfig = z.infer<typeof WorkflowSchema>;

/**
 * Validate workflow configuration
 */
export function validateWorkflow(data: unknown): WorkflowConfig {
  return WorkflowSchema.parse(data);
}

/**
 * Safe workflow validation (returns error instead of throwing)
 */
export function safeValidateWorkflow(data: unknown): {
  success: boolean;
  data?: WorkflowConfig;
  error?: string;
} {
  const result = WorkflowSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}
