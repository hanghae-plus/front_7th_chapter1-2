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
  steps: WorkflowStep[];
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
