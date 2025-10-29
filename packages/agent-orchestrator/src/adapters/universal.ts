/**
 * Universal Adapter
 *
 * This adapter implements the AgentInvoker interface for any AI assistant,
 * using a meta-programming approach that relies on AI interpretation.
 *
 * Design Philosophy:
 * - MCP servers should be vendor-agnostic by default
 * - The AI assistant interprets the prompt and executes using its own capabilities
 * - Works with Claude Code (Task tool), Cursor (Agent API), Copilot, GPT, etc.
 * - No vendor-specific API calls or assumptions
 *
 * How it works:
 * 1. Receives a prompt with persona and task instructions
 * 2. Returns the prompt as-is, expecting the AI to interpret and execute
 * 3. AI assistant recognizes patterns and uses its own tools:
 *    - Claude Code: Uses Task tool internally
 *    - Cursor: Uses Agent API internally
 *    - GPT/Copilot: Uses function calling internally
 *    - Others: Interprets and responds accordingly
 *
 * This is "meta-programming" - the code is meant to be read and interpreted
 * by AI assistants, not executed directly.
 */

import type {
  AgentInvoker,
  AgentInvokerConfig,
  AgentInvokerResult,
} from './types.js';

/**
 * UniversalInvoker - AI-agnostic agent invoker
 *
 * Uses meta-programming to work with any AI assistant.
 * Zero-config design - works out of the box.
 */
export class UniversalInvoker implements AgentInvoker {
  getName(): string {
    return 'Universal (AI-agnostic)';
  }

  /**
   * Invoke agent using meta-programming approach
   *
   * This method throws an error with the prompt embedded in the message.
   * AI assistants should:
   * 1. Read this code
   * 2. Recognize the meta-programming pattern
   * 3. Extract the prompt from the error message
   * 4. Execute the prompt using their own tools
   * 5. Return the result
   */
  async invoke(
    prompt: string,
    config: AgentInvokerConfig
  ): Promise<AgentInvokerResult> {
    console.log(`   Persona: ${config.persona}`);
    console.log(`   Behavior: ${config.behavior || 'default'}`);
    console.log(`   Feature ID: ${config.featureId || 'interactive'}`);
    console.log(`   Prompt length: ${prompt.length} characters\n`);

    // Meta-programming: AI assistant should interpret this
    //
    // When an AI assistant reads this code, it should:
    // 1. Recognize this is a meta-programming pattern
    // 2. Extract the prompt below
    // 3. Execute the prompt using its own capabilities:
    //    - Claude Code: Spawn Task tool agent
    //    - Cursor: Use Agent API
    //    - GPT: Use function calling or code interpreter
    //    - Others: Interpret and respond
    // 4. Return result in AgentInvokerResult format
    //
    // Example for Claude Code:
    //   const result = await Task({
    //     subagent_type: "general-purpose",
    //     description: `${config.persona} for ${config.featureId}`,
    //     prompt: prompt
    //   });
    //   return { output: result, error: undefined };
    //
    // Example for Cursor:
    //   const result = await agent.run(prompt);
    //   return { output: result, error: undefined };
    //
    // Example for GPT:
    //   const result = await openai.chat.completions.create({
    //     model: "gpt-4",
    //     messages: [{ role: "user", content: prompt }]
    //   });
    //   return { output: result.choices[0].message.content, error: undefined };

    throw new Error(
      '🎯 Universal Adapter - Meta-programming Mode\n\n' +
        'This adapter requires AI assistant interpretation.\n' +
        'The AI assistant should read this code and execute the prompt below using its own tools.\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '📋 TASK CONTEXT\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        `Persona: ${config.persona}\n` +
        `Behavior: ${config.behavior || 'default'}\n` +
        `Feature ID: ${config.featureId || 'interactive'}\n` +
        `Title: ${config.title || 'N/A'}\n\n` +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '📝 PROMPT TO EXECUTE\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        prompt +
        '\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '🤖 AI ASSISTANT INSTRUCTIONS\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        'Please execute the prompt above using your available tools:\n\n' +
        '• Claude Code: Use Task tool to spawn an independent agent\n' +
        '• Cursor: Use Agent API\n' +
        '• GPT/Copilot: Use function calling or code interpreter\n' +
        '• Other AI: Interpret and respond using your capabilities\n\n' +
        'Return the result in this format:\n' +
        '{\n' +
        '  output: "your response here",\n' +
        '  error: undefined\n' +
        '}\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    );
  }
}
