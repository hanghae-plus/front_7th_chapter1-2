/**
 * Core types for the agent orchestration system
 *
 * Note: Many types are now inferred from Zod schemas to ensure consistency
 * between runtime validation and compile-time types.
 */

// Re-export types from schemas (Single Source of Truth)
export type { PersonaConfig as PersonaDefinition } from '../schema/persona.schema.js';
export type {
  ContextPrompt,
  WorkflowContextConfig,
  WorkflowStep,
  WorkflowConfig as WorkflowDefinition,
} from '../schema/workflow.schema.js';

export interface AgentConfig {
  persona: string;
  task: string;  // Task name (e.g., "implement-feature")
  featureId?: string;
  title?: string;
  contextPath?: string;
  inputs?: string[];
}

export interface AgentResult {
  output: string;
  outputFiles: string[];
  contextUpdate?: ContextUpdate;
  duration: number;
  error?: string;
}

export interface ContextUpdate {
  key_findings?: string[];
  new_terminology?: Array<{
    term: string;
    definition: string;
  }>;
  decisions?: Array<{
    id: string;
    text: string;
  }>;
  critical_files?: string[];
  metrics?: Array<{
    name: string;
    value: string;
    baseline?: string;
  }>;
}

export interface WorkflowContext {
  workflowName: string;
  featureId: string;
  title: string;
  prompt?: string;  // User's natural language request
  userContext?: Record<string, string | string[]>;  // User-provided context
  status: 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  steps: StepExecution[];
}

export interface StepExecution {
  persona: string;
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string;
  duration?: number;
  error?: string;
}
