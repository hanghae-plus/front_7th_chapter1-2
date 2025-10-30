/**
 * Claude Code Adapter
 *
 * This adapter implements the AgentInvoker interface for Claude Code,
 * using Claude Code's Task tool to spawn independent agent instances.
 *
 * Architecture:
 * - When running in MCP server (Node.js), returns structured instruction
 * - Claude Code MCP client interprets the instruction and spawns SubAgent
 * - SubAgent executes the prompt and returns result back through MCP
 */

import type {
  AgentInvoker,
  AgentInvokerConfig,
  AgentInvokerResult,
} from './types.js';

/**
 * Special marker for Claude Code to recognize SubAgent instructions
 */
const SUBAGENT_MARKER = '🤖 CLAUDE_CODE_SUBAGENT_INSTRUCTION';

/**
 * ClaudeCodeInvoker - Agent invoker implementation for Claude Code
 *
 * This adapter enables multi-agent orchestration by instructing Claude Code
 * to spawn SubAgents through its Task tool.
 *
 * How it works:
 * 1. MCP Server returns structured SubAgent instruction
 * 2. Claude Code (MCP client) recognizes the instruction marker
 * 3. Claude Code spawns SubAgent using Task tool with the prompt
 * 4. SubAgent result is captured and returned
 *
 * Zero-config design:
 * - Works seamlessly with Claude Code's Task tool
 * - Model/temperature controlled by Claude Code settings
 * - Automatic fallback if Task tool unavailable
 */
export class ClaudeCodeInvoker implements AgentInvoker {
  getName(): string {
    return 'Claude Code (SubAgent via MCP)';
  }

  async invoke(prompt: string, config: AgentInvokerConfig): Promise<AgentInvokerResult> {
    try {
      console.log(`   Feature ID: ${config.featureId || 'interactive'}`);
      console.log(`   Prompt length: ${prompt.length} characters\n`);

      // Check if Task tool is available (Claude Code environment)
      const TaskTool = (globalThis as any).Task;

      if (typeof TaskTool !== 'function') {
        // Task tool not available - return instruction for manual execution
        console.warn('⚠️  Task tool not available in current environment');
        console.warn('   Returning manual instruction instead');
        const instruction = this.generateSubAgentInstruction(prompt, config);
        return {
          output: instruction,
          error: undefined,
        };
      }

      // Task tool available - execute SubAgent directly!
      console.log('🚀 Invoking Task tool to spawn SubAgent...');

      const description = `${config.persona}.${config.task} for ${config.featureId || 'interactive'}`;

      // Call Claude Code's Task tool
      const result = await TaskTool({
        subagent_type: 'general-purpose',
        description: description,
        prompt: prompt,
      });

      console.log('✅ SubAgent execution completed');

      return {
        output: result || '',
        error: undefined,
      };
    } catch (error) {
      console.error('❌ SubAgent execution failed:', error);
      return {
        output: '',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate structured instruction for Claude Code to spawn SubAgent
   *
   * The instruction format is designed to be:
   * 1. Human-readable (Claude can interpret it)
   * 2. Machine-parseable (can be automated if needed)
   * 3. Self-contained (includes all context for SubAgent)
   */
  private generateSubAgentInstruction(prompt: string, config: AgentInvokerConfig): string {
    return `${SUBAGENT_MARKER}

Please spawn a SubAgent using the Task tool with the following configuration:

**SubAgent Configuration:**
- Type: general-purpose
- Persona: ${config.persona}
- Task: ${config.task}
- Feature ID: ${config.featureId || 'interactive'}
- Description: ${config.persona}.${config.task} for ${config.featureId || 'interactive'}

**SubAgent Prompt:**
\`\`\`
${prompt}
\`\`\`

**Instructions:**
1. Use the Task tool to spawn a SubAgent with the above prompt
2. Wait for the SubAgent to complete its work
3. Return the SubAgent's output as the result
4. If SubAgent fails, return the error message

**Expected Task Tool Call:**
\`\`\`
Task({
  subagent_type: 'general-purpose',
  description: '${config.persona}.${config.task} for ${config.featureId || 'interactive'}',
  prompt: <the prompt above>
})
\`\`\`
`;
  }
}
