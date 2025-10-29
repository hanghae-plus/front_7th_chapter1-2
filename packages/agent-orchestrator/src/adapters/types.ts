
/**
 * AgentInvoker - Universal interface for invoking AI agents
 *
 * This interface abstracts away vendor-specific implementations,
 * allowing the same orchestration system to work with:
 * - Claude Code (Task tool)
 * - Cursor (Agent API)
 * - GitHub Copilot Workspace
 * - OpenAI Codex
 * - Any other AI coding assistant
 */

export interface AgentInvokerConfig {
  persona: string;
  behavior?: string;
  featureId?: string;
  title?: string;
  timeout?: number;
}

export interface AgentInvokerResult {
  output: string;
  error?: string;
}

/**
 * AgentInvoker interface
 *
 * Each AI vendor implements this interface to provide agent invocation
 * using their specific APIs or tools.
 */
export interface AgentInvoker {
  /**
   * Invoke an AI agent with a built prompt
   *
   * @param prompt - Complete prompt built by PromptBuilder
   * @param config - Agent configuration (persona, behavior, etc.)
   * @returns Agent's response as a string
   *
   * @example
   * // Claude Code implementation
   * const result = await invoker.invoke(prompt, {
   *   persona: 'analyst',
   *   behavior: 'analyze',
   *   featureId: 'F-123'
   * });
   *
   * @example
   * // Cursor implementation
   * const result = await invoker.invoke(prompt, {
   *   persona: 'qa',
   *   behavior: 'test-plan'
   * });
   */
  invoke(prompt: string, config: AgentInvokerConfig): Promise<AgentInvokerResult>;

  /**
   * Get invoker name for logging purposes
   */
  getName(): string;
}
