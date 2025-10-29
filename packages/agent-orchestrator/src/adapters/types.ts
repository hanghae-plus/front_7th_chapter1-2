/**
 * AgentInvoker - Universal interface for invoking AI agents
 *
 * Pragmatic Vendor-Independence:
 * This interface abstracts away vendor-specific implementations,
 * allowing the same orchestration system to work with multiple AIs.
 *
 * Available Adapters:
 * - Universal (default): Meta-programming for any AI (Cursor, Copilot, GPT, etc.)
 * - Claude Code: Uses programmable Task tool API
 *
 * Philosophy:
 * - Users already chose their AI/model - we don't override that
 * - Zero-config by default
 * - Environment variables for customization (ORCHESTRATOR_ADAPTER)
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
 * Each adapter implements this minimal interface.
 * No configuration needed - adapters work out of the box.
 */
export interface AgentInvoker {
  /**
   * Invoke an AI agent with a built prompt
   *
   * @param prompt - Complete prompt built by PromptBuilder
   * @param config - Agent configuration (persona, behavior, etc.)
   * @returns Agent's response
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
   * // Universal implementation (meta-programming)
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
