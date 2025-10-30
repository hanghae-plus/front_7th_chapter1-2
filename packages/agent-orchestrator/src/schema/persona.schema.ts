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

// Top-level persona config
export const PersonaSchema = z.object({
  version: z.string().default('1.0'),
  agent: AgentSchema,
  persona: PersonaLayerSchema,
  tasks: z.array(z.string()),
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
