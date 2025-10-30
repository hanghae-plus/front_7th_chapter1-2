import { AgentRunner } from '../core/agent-runner.js';
import { ContextManager } from '../core/context-manager.js';
import { FileManager } from '../utils/file-manager.js';
import { TaskRegistry } from '../utils/task-registry.js';
import { ConfigLoader } from '../utils/config-loader.js';
import type {
  WorkflowDefinition,
  WorkflowContext,
  WorkflowStep,
  AgentResult,
} from '../types/index.js';
import type { WorkflowRunOptions } from '../engine.js';
import type { TaskMetadata } from '../schema/task.schema.js';
import { resolve } from 'path';
import matter from 'gray-matter';

export class WorkflowRunner {
  private fileManager: FileManager;
  private taskRegistry: TaskRegistry;
  private contextManager: ContextManager;
  private runtimePath: string;
  private outputPath: string;

  constructor(
    private agentRunner: AgentRunner,
    private configLoader: ConfigLoader
  ) {
    this.fileManager = new FileManager();
    this.taskRegistry = new TaskRegistry();
    this.contextManager = new ContextManager(this.fileManager);

    // Get data paths from config
    const paths = this.configLoader.getPaths();
    this.runtimePath = paths.runtime;  // .ai/runtime
    this.outputPath = paths.output;     // .ai/output
  }

  /**
   * Run a complete workflow from start to finish
   */
  async run(options: WorkflowRunOptions): Promise<void> {
    const { workflowName, featureId, prompt, context, title } = options;
    const displayTitle = title || prompt.substring(0, 50) || 'Untitled';

    console.log(`\n Orchestrator: Workflow Execution Started\n`);
    console.log(`Workflow: ${workflowName}`);
    console.log(`Feature: ${featureId} - ${displayTitle}\n`);
    console.log(`Prompt: ${prompt}\n`);

    try {
      // 1. Load workflow definition
      const workflow = await this.loadWorkflow(workflowName);
      const totalSteps = workflow.steps.length;

      // 2. Initialize shared context
      const contextPath = resolve(this.runtimePath, `context/${workflowName}_${featureId}_context.md`);
      await this.contextManager.initializeContext(contextPath, {
        workflowName,
        featureId,
        title: displayTitle,
        prompt,
        userContext: context,
      });

      console.log(`Context initialized: ${contextPath}\n`);

      // 3. Initialize workflow state
      const workflowContext: WorkflowContext = {
        workflowName,
        featureId,
        title: displayTitle,
        prompt,
        userContext: context,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        steps: workflow.steps.map((s) => ({
          persona: s.persona,
          id: s.task,
          status: 'pending',
        })),
      };

      // 4. Execute each step
      for (const [index, step] of workflow.steps.entries()) {
        const stepNum = index + 1;
        const stepIdentifier = step.task;
        console.log(`[${stepNum}/${totalSteps}] Executing ${step.persona}.${stepIdentifier}...`);

        // Update step status
        workflowContext.steps[index].status = 'in_progress';

        try {
          let inputs: string[] = [];

          // Load task definition for future validation
          await this.loadTaskDefinition(step.task);

          // TODO: Resolve bindings and prepare inputs
          // When implemented, use taskDef to validate bindings against contract
          // For now, just use empty inputs
          inputs = [];

          console.log(`   Using task-based execution: ${step.task}`);

          // Execute agent
          const result = await this.agentRunner.runAgent({
            persona: step.persona,
            task: step.task,
            featureId,
            title,
            contextPath,
            inputs,
          });

          // Check for errors
          if (result.error) {
            throw new Error(result.error);
          }

          // Validate output
          await this.validateOutput(result, step);

          // Update context with agent's findings
          if (result.contextUpdate) {
            await this.contextManager.updateContext(
              contextPath,
              result.contextUpdate,
              step.persona
            );
          }

          // Append execution log
          await this.contextManager.appendExecutionLog(contextPath, {
            persona: step.persona,
            behaviorId: stepIdentifier,
            output: result.outputFiles[0], // First output file
            status: 'completed',
            duration: result.duration,
            keyFindings: result.contextUpdate?.key_findings,
          });

          // Update step status
          workflowContext.steps[index].status = 'completed';
          workflowContext.steps[index].output = result.outputFiles[0];
          workflowContext.steps[index].duration = result.duration;

          const fileSize = result.outputFiles[0]
            ? await this.getFileSize(result.outputFiles[0])
            : 'N/A';
          console.log(`✅ [${stepNum}/${totalSteps}] ${step.persona}.${stepIdentifier} complete`);
          console.log(`   Output: ${result.outputFiles[0] || 'None'} (${fileSize})`);
          console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s\n`);
        } catch (error) {
          // Handle step failure
          const errorMessage = error instanceof Error ? error.message : String(error);

          console.error(`❌ [${stepNum}/${totalSteps}] ${step.persona}.${stepIdentifier} failed`);
          console.error(`   Error: ${errorMessage}\n`);

          workflowContext.steps[index].status = 'failed';
          workflowContext.steps[index].error = errorMessage;

          // Append error to execution log
          await this.contextManager.appendExecutionLog(contextPath, {
            persona: step.persona,
            behaviorId: stepIdentifier,
            status: 'failed',
            duration: 0,
            error: errorMessage,
          });

          // TODO: Implement retry logic
          // For now, fail the entire workflow
          throw error;
        }
      }

      // 5. Mark workflow as completed
      workflowContext.status = 'completed';
      workflowContext.completedAt = new Date().toISOString();

      // 6. Save execution state
      const statePath = resolve(this.runtimePath, `state/${workflowName}_${featureId}_execution.json`);
      await this.fileManager.writeFile(statePath, JSON.stringify(workflowContext, null, 2));

      // 7. Generate summary
      await this.generateSummary(workflowContext, contextPath);

      console.log(`\n🎉 Workflow ${workflowName} complete!\n`);
      console.log(
        `📁 Generated Documents: ${workflowContext.steps.filter((s) => s.output).length}`
      );
      workflowContext.steps
        .filter((s) => s.output)
        .forEach((s) => {
          console.log(`   - ${s.output}`);
        });
      console.log(`\n📊 Execution State: ${statePath}`);
      console.log(`📌 Shared Context: ${contextPath}`);
      console.log(`⏱️  Total Duration: ${this.calculateTotalDuration(workflowContext)}s\n`);
      console.log(`✅ All ${totalSteps} steps passed validation\n`);
    } catch (error) {
      console.error(
        `\n💥 Workflow failed: ${error instanceof Error ? error.message : String(error)}\n`
      );
      throw error;
    }
  }

  /**
   * Load workflow definition from YAML
   */
  private async loadWorkflow(workflowName: string): Promise<WorkflowDefinition> {
    // Use config loader to find workflow file (supports cascading)
    const workflowPath = this.configLoader.getWorkflowPath(workflowName);
    if (!workflowPath) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    const rawWorkflow = await this.fileManager.readYAML<WorkflowDefinition>(workflowPath);

    // Validate workflow schema
    try {
      const { safeValidateWorkflow } = await import('../schema/workflow.schema.js');
      const validation = safeValidateWorkflow(rawWorkflow);

      if (!validation.success) {
        throw new Error(`Invalid workflow schema: ${validation.error}`);
      }

      console.log(`✅ Workflow schema validation passed: ${workflowName}`);
    } catch (error) {
      console.warn(`⚠️  Schema validation error (continuing anyway): ${error instanceof Error ? error.message : String(error)}`);
    }

    return rawWorkflow as WorkflowDefinition;
  }

  /**
   * Validate agent output
   */
  private async validateOutput(result: AgentResult, _step: WorkflowStep): Promise<void> {
    // Basic validation
    if (!result.output || result.output.length === 0) {
      throw new Error('!! Agent produced no output');
    }

    // Check if output file exists
    if (result.outputFiles.length === 0) {
      console.warn('!!  No output files detected');
    }

    // TODO: More sophisticated validation
    // - Check file size > 100 bytes
    // - Validate against template structure
    // - Check for placeholder text
  }

  /**
   * Get file size in human-readable format
   */
  private async getFileSize(path: string): Promise<string> {
    try {
      const content = await this.fileManager.readFile(path);
      const bytes = Buffer.byteLength(content, 'utf-8');

      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;

      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    } catch {
      return '!! N/A';
    }
  }

  /**
   * Calculate total workflow duration
   */
  private calculateTotalDuration(context: WorkflowContext): string {
    const total = context.steps.reduce((sum, step) => sum + (step.duration || 0), 0);
    return (total / 1000).toFixed(1);
  }

  /**
   * Generate workflow summary document
   */
  private async generateSummary(context: WorkflowContext, contextPath: string): Promise<void> {
    const summaryPath = resolve(
      this.outputPath,
      `feature/${context.featureId}/00_${context.workflowName.toUpperCase()}_SUMMARY.md`
    );

    const summary = `# ${context.workflowName} Workflow Summary - ${context.featureId}

**Feature**: ${context.title}
**Status**: ${context.status}
**Started**: ${context.startedAt}
**Completed**: ${context.completedAt}
**Duration**: ${this.calculateTotalDuration(context)}s

---

## Generated Documents

${context.steps
  .filter((s) => s.output)
  .map(
    (s, i) =>
      `${i + 1}. **${s.persona}.${s.id}**: ${s.output} (${(s.duration! / 1000).toFixed(1)}s)`
  )
  .join('\n')}

---

## Execution Summary

- **Total Steps**: ${context.steps.length}
- **Completed**: ${context.steps.filter((s) => s.status === 'completed').length}
- **Failed**: ${context.steps.filter((s) => s.status === 'failed').length}

---

## Shared Context

All key findings, terminology, decisions, and metrics are documented in:
- ${contextPath}

---

## Next Steps

Review the generated documents and shared context to understand the complete analysis.
`;

    await this.fileManager.writeFile(summaryPath, summary);
    console.log(`📄 Summary generated: ${summaryPath}`);
  }

  /**
   * Load task definition from categorized task directory
   *
   * Uses TaskRegistry for efficient lookup.
   */
  private async loadTaskDefinition(taskName: string): Promise<TaskMetadata | null> {
    try {
      // Use registry to get task file path
      const relativePath = await this.taskRegistry.getTaskFilePath(taskName);
      const taskPath = resolve(this.configLoader.getPaths().data, relativePath);
      const content = await this.fileManager.readFile(taskPath);
      const parsed = matter(content);

      if (!parsed.data || !parsed.data.task) {
        console.warn(`⚠️  Task file ${taskName}.md has no frontmatter or task field`);
        return null;
      }

      return parsed.data as TaskMetadata;
    } catch (error) {
      console.warn(`⚠️  Failed to load task definition: ${taskName}`);
      return null;
    }
  }

}
