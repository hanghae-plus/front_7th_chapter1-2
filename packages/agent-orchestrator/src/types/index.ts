/**
 * Core types for the agent orchestration system
 */

export interface PersonaDefinition {
  version: string;
  agent: {
    name: string;
    title: string;
    description: string;
    when_to_use: string;
    icon: string;
  };
  persona: {
    role: string;
    style: string;
    identity: string;
    focus: string;
    core_principles: string[];
  };
  behavior: {
    [key: string]: BehaviorDefinition;
  };
}

export interface BehaviorDefinition {
  description: string;
  load?: string[];
  inputs?: string[];
  output?: string;
  context?: string;
}

export interface WorkflowDefinition {
  name: string;
  description?: string;
  context?: WorkflowContextConfig;  // Interactive context prompts
  steps: WorkflowStep[];
}

/**
 * Workflow Context Configuration
 *
 * Defines what additional context/inputs a workflow needs from the user.
 * Each workflow can declare its own requirements.
 */
export interface WorkflowContextConfig {
  interactive: boolean;  // Whether to prompt user for additional context
  prompts?: ContextPrompt[];  // Questions to ask the user
}

/**
 * Context Prompt Definition
 *
 * A question to ask the user for additional context.
 */
export interface ContextPrompt {
  key: string;  // Identifier for this prompt (e.g., "requirements", "existing_code")
  question: string;  // Question to show user (supports Korean/English)
  type?: 'file' | 'text';  // Type of input expected (default: 'file')
  required?: boolean;  // Whether this input is required (default: false)
  examples?: string[];  // Example values to show user
  default?: string;  // Default value if user provides nothing
}

export interface WorkflowStep {
  persona: string;
  id: string;
  args?: string[];
}

export interface AgentConfig {
  persona: string;
  behavior?: string;
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
