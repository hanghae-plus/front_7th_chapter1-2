/**
 * Claude Code Adapter
 *
 * This adapter implements the AgentInvoker interface for Claude Code,
 * using Claude Code's Task tool to spawn independent agent instances.
 */

import type {
  AgentInvoker,
  AgentInvokerConfig,
  AgentInvokerResult,
} from './types.js';

/**
 * ClaudeCodeInvoker - Agent invoker implementation for Claude Code
 *
 * Uses Claude Code's Task tool to create independent Claude instances
 * with custom system prompts (personas).
 *
 * Zero-config design:
 * - Uses Claude Code's Task tool API directly
 * - Model/temperature controlled by Claude Code settings (not overridden)
 * - Works out of the box
 */
export class ClaudeCodeInvoker implements AgentInvoker {
  getName(): string {
    return 'Claude Code (Task Tool)';
  }

  async invoke(prompt: string, config: AgentInvokerConfig): Promise<AgentInvokerResult> {
    try {
      console.log(`   Feature ID: ${config.featureId || 'interactive'}`);
      console.log(`   Prompt length: ${prompt.length} characters\n`);

      // Call Claude Code's Task tool
      // @ts-ignore - Task tool is available in Claude Code runtime
      const result = await Task({
        subagent_type: 'general-purpose',
        description: `${config.persona}${config.behavior ? `.${config.behavior}` : ''} for ${
          config.featureId || 'interactive'
        }`,
        prompt: prompt,
      });

      return {
        output: result,
        error: undefined,
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
