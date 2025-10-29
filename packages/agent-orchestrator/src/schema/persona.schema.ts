import { z } from 'zod';

// Agent metadata (the persona's identity)
export const AgentSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string().optional(),
  when_to_use: z.string().optional(),
  icon: z.string().optional(),
});

// Persona tone/role/style layer
export const PersonaLayerSchema = z.object({
  role: z.string().optional(),
  style: z.string().optional(),
  identity: z.string().optional(),
  focus: z.string().optional(),
  core_principles: z.array(z.string()).optional(),
});

// Each command/behavior the persona can execute
export const BehaviorSchema = z.object({
  id: z.string().optional(), // optional alias for referencing
  description: z.string().optional(),
  load: z.array(z.string()).optional(), // relative paths to load (e.g. templates)
  inputs: z.array(z.string()).optional(), // additional context files
  output: z.string().optional(), // destination path template (e.g. .ai/output/{{featureId}}/file.md)
});
// .refine(b => !b.output || !b.output.endsWith('/'), { message: 'output must be a file path, not a folder' });

// Full behavior map (command → behavior)
export const BehaviorMapSchema = z.record(z.string(), BehaviorSchema);

// Top-level persona config
export const PersonaSchema = z.object({
  version: z.string().default('1.0'),
  agent: AgentSchema,
  persona: PersonaLayerSchema,
  behavior: BehaviorMapSchema,
});

export type PersonaConfig = z.infer<typeof PersonaSchema>;

/**
 * Validate persona configuration
 */
export function validatePersona(data: unknown): PersonaConfig {
  return PersonaSchema.parse(data);
}

/**
 * Safe persona validation (returns error instead of throwing)
 */
export function safeValidatePersona(data: unknown): {
  success: boolean;
  data?: PersonaConfig;
  error?: string;
} {
  const result = PersonaSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}
