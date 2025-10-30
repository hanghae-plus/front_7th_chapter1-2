import { z } from 'zod';

/**
 * Task Contract Schema
 *
 * Defines the contract for a task - what inputs it requires and what outputs it produces.
 * This ensures type safety and clear interfaces between workflow steps.
 *
 * Philosophy:
 * - Task = Pure Function (Input → Output)
 * - Contract = Type signature
 * - Workflow provides concrete bindings
 */

// Contract field definition
export const ContractFieldSchema = z.object({
  type: z.enum(['file', 'text', 'array']),
  description: z.string(),
  required: z.boolean().default(true),
  multiple: z.boolean().default(false), // For array types
});

// Task contract
export const TaskContractSchema = z.object({
  inputs: z.record(ContractFieldSchema),
  outputs: z.record(ContractFieldSchema),
});

// Task metadata (from frontmatter)
export const TaskMetadataSchema = z.object({
  task: z.string().min(1, 'Task name is required'),
  description: z.string(),
  contract: TaskContractSchema,
  template: z.string().optional(), // Template file reference
});

// Full task definition (metadata + content)
export const TaskDefinitionSchema = z.object({
  metadata: TaskMetadataSchema,
  content: z.string(), // Markdown content after frontmatter
});

// Type exports
export type ContractField = z.infer<typeof ContractFieldSchema>;
export type TaskContract = z.infer<typeof TaskContractSchema>;
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>;
export type TaskDefinition = z.infer<typeof TaskDefinitionSchema>;

/**
 * Validate task metadata
 */
export function validateTaskMetadata(data: unknown): TaskMetadata {
  return TaskMetadataSchema.parse(data);
}

/**
 * Safe task validation
 */
export function safeValidateTaskMetadata(data: unknown): {
  success: boolean;
  data?: TaskMetadata;
  error?: string;
} {
  const result = TaskMetadataSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}
