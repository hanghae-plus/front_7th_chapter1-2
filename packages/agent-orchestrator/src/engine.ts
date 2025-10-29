/**
 * Orchestrator Engine
 *
 * Core engine that provides a unified API for workflow execution.
 * Used by both CLI and MCP server.
 *
 * This is the main entry point for all orchestration operations.
 */

import { AgentRunner } from './core/agent-runner.js';
import { WorkflowRunner } from './runners/workflow-runner.js';
import { ConfigLoader } from './utils/config-loader.js';
import type { AgentInvoker } from './adapters/types.js';

export interface WorkflowRunOptions {
  workflowName: string;
  featureId: string;
  prompt: string;  // User's natural language request
  context?: Record<string, string | string[]>;  // Collected context (key: value from prompts)

  // Deprecated: use prompt instead
  title?: string;
}

export interface WorkflowResult {
  success: boolean;
  workflowName: string;
  featureId: string;
  duration: number;
  stepsCompleted: number;
  totalSteps: number;
  outputFiles: string[];
  summary: string;
  error?: string;
}

export interface WorkflowInfo {
  name: string;
  description?: string;
  steps: number;
  personas: string[];
}

export class OrchestratorEngine {
  private agentRunner: AgentRunner | null = null;
  private workflowRunner: WorkflowRunner | null = null;
  private configLoader: ConfigLoader;

  constructor(
    private invoker: AgentInvoker | null,
    workspaceRoot?: string,
    dataPath?: string
  ) {
    this.configLoader = new ConfigLoader(workspaceRoot, dataPath);

    // Initialize runners if invoker is provided
    if (invoker) {
      this.agentRunner = new AgentRunner(invoker);
      this.workflowRunner = new WorkflowRunner(this.agentRunner, this.configLoader);
    }
  }

  /**
   * Run a workflow
   */
  async runWorkflow(options: WorkflowRunOptions): Promise<WorkflowResult> {
    if (!this.workflowRunner) {
      throw new Error('WorkflowRunner not initialized. Invoker is required.');
    }

    const startTime = Date.now();

    try {
      console.error(`\n🎼 Starting workflow: ${options.workflowName}`);
      console.error(`   Feature: ${options.featureId}${options.title ? ` - ${options.title}` : ''}\n`);

      // Run workflow
      await this.workflowRunner.run(options);

      const duration = Date.now() - startTime;

      // Generate summary
      const paths = this.configLoader.getPaths();
      const outputLocation = `${paths.output}/feature/${options.featureId}/`;

      const summary = `
✅ Workflow ${options.workflowName} completed successfully!

Feature ID: ${options.featureId}
${options.title ? `Title: ${options.title}\n` : ''}
Duration: ${(duration / 1000).toFixed(1)}s

📁 Output files generated in:
   ${outputLocation}

🔍 Review the generated documents and proceed with development.
`.trim();

      return {
        success: true,
        workflowName: options.workflowName,
        featureId: options.featureId,
        duration,
        stepsCompleted: 0, // TODO: get from workflow runner
        totalSteps: 0, // TODO: get from workflow runner
        outputFiles: [], // TODO: get from workflow runner
        summary,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        workflowName: options.workflowName,
        featureId: options.featureId,
        duration,
        stepsCompleted: 0,
        totalSteps: 0,
        outputFiles: [],
        summary: '',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * List all available workflows
   */
  async listWorkflows(): Promise<WorkflowInfo[]> {
    const { FileManager } = await import('./utils/file-manager.js');
    const fileManager = new FileManager();
    const workflowNames = this.configLoader.listWorkflows();

    const workflows: WorkflowInfo[] = [];

    for (const name of workflowNames) {
      try {
        const workflowPath = this.configLoader.getWorkflowPath(`${name}.yaml`);
        if (!workflowPath) continue;

        const workflow = await fileManager.readYAML<any>(workflowPath);

        workflows.push({
          name,
          description: workflow.description,
          steps: workflow.steps?.length || 0,
          personas: workflow.steps
            ? [...new Set(workflow.steps.map((s: any) => s.persona))]
            : [],
        });
      } catch (error) {
        console.error(`Failed to parse workflow ${name}:`, error);
      }
    }

    return workflows;
  }

  /**
   * List all available personas
   */
  async listPersonas(): Promise<string[]> {
    return this.configLoader.listPersonas();
  }

  /**
   * Get workflow status from execution state file
   */
  async getWorkflowStatus(
    workflowName: string,
    featureId: string
  ): Promise<any> {
    const { FileManager } = await import('./utils/file-manager.js');
    const { resolve } = await import('path');
    const fileManager = new FileManager();

    try {
      const paths = this.configLoader.getPaths();
      const statePath = resolve(paths.runtime, `state/${workflowName}_${featureId}_execution.json`);
      const content = await fileManager.readFile(statePath);
      return JSON.parse(content);
    } catch (error) {
      return {
        error: 'Workflow status not found. Has it been run yet?',
      };
    }
  }

  /**
   * Get generated output documents for a feature
   */
  async getOutput(featureId: string, documentId?: string): Promise<string> {
    const { FileManager } = await import('./utils/file-manager.js');
    const { readdirSync } = await import('fs');
    const { resolve } = await import('path');
    const fileManager = new FileManager();

    try {
      const paths = this.configLoader.getPaths();
      const featureDir = resolve(paths.output, `feature/${featureId}`);

      if (documentId) {
        // Get specific document
        const docPath = resolve(featureDir, `${documentId}.md`);
        return await fileManager.readFile(docPath);
      } else {
        // List all documents
        const files = readdirSync(featureDir).filter((f) => f.endsWith('.md'));
        return `📁 Output documents for ${featureId}:\n\n${files.map((f) => `  - ${f}`).join('\n')}`;
      }
    } catch (error) {
      return `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Get workflow definition (for prepare_workflow)
   */
  async getWorkflowDefinition(workflowName: string): Promise<WorkflowInfo & { contextConfig?: any }> {
    const { FileManager } = await import('./utils/file-manager.js');
    const fileManager = new FileManager();

    try {
      const workflowPath = this.configLoader.getWorkflowPath(`${workflowName}.yaml`);
      if (!workflowPath) {
        throw new Error(`Workflow '${workflowName}' not found`);
      }

      const workflow = await fileManager.readYAML<any>(workflowPath);

      // Validate workflow schema
      try {
        const { safeValidateWorkflow } = await import('./schema/workflow.schema.js');
        const validation = safeValidateWorkflow(workflow);

        if (!validation.success) {
          console.warn(`⚠️  Workflow schema validation failed: ${validation.error}`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not validate workflow schema: ${error instanceof Error ? error.message : String(error)}`);
      }

      return {
        name: workflowName,
        description: workflow.description,
        steps: workflow.steps?.length || 0,
        personas: workflow.steps
          ? [...new Set(workflow.steps.map((s: any) => s.persona))]
          : [],
        contextConfig: workflow.context,  // Include context configuration
      };
    } catch (error) {
      throw new Error(`Failed to load workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get configuration summary
   */
  getConfigSummary(): string {
    return this.configLoader.getSummary();
  }
}
