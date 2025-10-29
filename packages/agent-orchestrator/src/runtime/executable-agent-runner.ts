/**
 * ExecutableAgentRunner - Runtime implementation with actual Task tool
 *
 * This file extends AgentRunner with the actual Task tool implementation.
 * It's meant to be used by Claude Code when executing workflows.
 *
 * NOTE: The `callTaskTool` method in this class will be implemented
 * by Claude Code at runtime using its internal Task tool.
 */

import { AgentRunner } from '../core/agent-runner.js';
import type { AgentConfig } from '../types/index.js';

export class ExecutableAgentRunner extends AgentRunner {
  /**
   * Actual Task tool implementation
   *
   * This will be called by Claude Code to spawn independent agent instances.
   */
  protected async callTaskTool(config: AgentConfig, prompt: string): Promise<string> {
    console.log(
      `\n !! Spawning agent: ${config.persona}${config.behavior ? `.${config.behavior}` : ''}`
    );
    console.log(`   Feature ID: ${config.featureId || 'interactive'}`);
    console.log(`   Prompt length: ${prompt.length} characters\n`);

    // This method will be intercepted and replaced by Claude Code
    // with actual Task tool call at runtime.
    // The code below is a placeholder that should never execute.

    throw new Error(
      'ExecutableAgentRunner.callTaskTool must be executed within Claude Code. ' +
        'This is a runtime hook that should be replaced with Task tool invocation.'
    );
  }
}
