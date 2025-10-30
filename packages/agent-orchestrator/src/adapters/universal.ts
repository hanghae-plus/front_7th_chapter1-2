/**
 * Universal Adapter - Smart Auto-Detection with Fallback
 *
 * This adapter provides a truly universal experience through:
 * 1. **Environment Auto-Detection**: Automatically detects Claude Code, Cursor, etc.
 * 2. **Custom Plugin Support**: Load user-provided adapters from workspace
 * 3. **Manual Fallback**: Provides clear instructions when automation isn't possible
 *
 * Design Philosophy:
 * - Be honest about limitations (not magic, just smart detection)
 * - Fail gracefully with helpful guidance
 * - Support extensibility through plugins
 * - Zero-config when possible, configurable when needed
 *
 * Usage:
 *
 * 1. Auto-detection (zero-config):
 *    Just use it - will detect Claude Code, Cursor, etc.
 *
 * 2. Custom adapter (for power users):
 *    ```bash
 *    export ORCHESTRATOR_CUSTOM_ADAPTER=".ai/adapters/my-adapter.js"
 *    ```
 *
 * 3. Manual mode (fallback):
 *    Provides instructions for manual execution when auto-detection fails
 */

import type {
  AgentInvoker,
  AgentInvokerConfig,
  AgentInvokerResult,
} from './types.js';

/**
 * UniversalInvoker - Simple environment detection with manual fallback
 *
 * Responsibilities:
 * 1. Detect runtime environment (Claude Code only for now)
 * 2. Delegate to detected adapter if available
 * 3. Provide manual instructions if no detection
 *
 * NOT responsible for:
 * - Custom adapter loading (handled by loader.ts)
 * - Fallback logic (handled by caller/server)
 * - Complex retry strategies
 */
export class UniversalInvoker implements AgentInvoker {
  private detectedEnvironment?: string;

  constructor() {
    // Detect environment once during construction
    this.detectedEnvironment = this.detectEnvironment() || undefined;

    if (this.detectedEnvironment) {
      console.log(`🔍 Universal adapter detected environment: ${this.detectedEnvironment}`);
    } else {
      console.log(`📋 Universal adapter in manual mode (no environment detected)`);
    }
  }

  getName(): string {
    if (this.detectedEnvironment) {
      return `Universal (Detected: ${this.detectedEnvironment})`;
    }
    return 'Universal (Manual Mode)';
  }

  /**
   * Invoke agent with environment detection
   *
   * Simple strategy:
   * 1. If environment detected → delegate to that adapter
   * 2. Otherwise → return manual instructions
   *
   * Note: Caller (server/engine) handles complex fallback logic
   */
  async invoke(
    prompt: string,
    config: AgentInvokerConfig
  ): Promise<AgentInvokerResult> {
    console.log(`   Persona: ${config.persona}`);
    console.log(`   Task: ${config.task}`);
    console.log(`   Feature ID: ${config.featureId || 'interactive'}`);
    console.log(`   Prompt length: ${prompt.length} characters\n`);

    // If environment detected, delegate directly
    if (this.detectedEnvironment) {
      console.log(`🔍 Delegating to detected adapter: ${this.detectedEnvironment}`);

      // Direct import to avoid circular dependency with loader
      if (this.detectedEnvironment === 'claude-code') {
        const { ClaudeCodeInvoker } = await import('./claude-code.js');
        const adapter = new ClaudeCodeInvoker();
        return await adapter.invoke(prompt, config);
      }

      // For other adapters (future), use loader
      const { loadAdapter } = await import('./loader.js');
      const adapter = await loadAdapter(this.detectedEnvironment);
      return await adapter.invoke(prompt, config);
    }

    // No detection - provide manual instructions
    console.log(`📋 No automation available - returning manual instructions`);
    return {
      output: this.buildManualInstructions(prompt, config),
      error: undefined,
    };
  }

  /**
   * Detect runtime environment
   *
   * IMPORTANT: Only detects environments where we have working adapters.
   *
   * Currently supported auto-detection:
   * - **claude-code**: Detects Task tool API (src/adapters/claude-code.ts exists)
   * - **[user-specified]**: Via MCP_RUNTIME env var (for future/custom adapters)
   *
   * For other environments (Cursor, Copilot, VSCode, etc.):
   * - We don't have built-in adapters yet
   * - Use ORCHESTRATOR_ADAPTER=your-adapter-name
   * - Or ORCHESTRATOR_CUSTOM_ADAPTER=.ai/adapters/your-adapter.js
   * - See src/adapters/README.md for creating custom adapters
   *
   * Why this approach?
   * - Honest: We only claim to detect what we can actually handle
   * - No false positives: Detection success = execution success
   * - Clear guidance: User knows what to do if detection fails
   */
  private detectEnvironment(): string | null {
    // Check for Claude Code (only environment with built-in adapter)
    // Detection: Task tool available in global scope
    if (typeof (globalThis as any).Task === 'function') {
      return 'claude-code';
    }

    // Check for user-specified runtime hint
    // Useful for:
    // - Future built-in adapters we add
    // - Custom adapters that match our adapter naming
    // - Testing and development
    // - Power users who know what they're doing
    if (process.env.MCP_RUNTIME) {
      return process.env.MCP_RUNTIME;
    }

    // No built-in adapter available for this environment
    // User should configure:
    // - ORCHESTRATOR_ADAPTER (if adapter exists in src/adapters/)
    // - ORCHESTRATOR_CUSTOM_ADAPTER (for custom adapter files)
    return null;
  }

  /**
   * Build manual instructions for user
   *
   * When automation isn't available, provide clear instructions
   * for manual execution.
   */
  private buildManualInstructions(
    prompt: string,
    config: AgentInvokerConfig
  ): string {
    const outputPath = `.ai/output/feature/${config.featureId || 'unknown'}/${config.persona}.${config.task}.md`;

    return `
# 📋 Manual Agent Execution Required

The Universal adapter couldn't detect your environment or find a custom adapter.
Please execute this agent manually.

## 🎯 Agent Configuration

- **Persona**: ${config.persona}
- **Task**: ${config.task}
- **Feature ID**: ${config.featureId || 'N/A'}
- **Title**: ${config.title || 'N/A'}

## 📝 Prompt to Execute

${prompt}

## 🔧 How to Proceed

### Option 1: Use a Vendor-Specific Adapter (Recommended)

Set the adapter via environment variable:

\`\`\`bash
# For Claude Code
export ORCHESTRATOR_ADAPTER=claude-code

# For your custom adapter
export ORCHESTRATOR_ADAPTER=your-adapter-name
\`\`\`

Then re-run the workflow.

### Option 2: Manual Execution

1. **Copy the prompt above**
2. **Execute it** in your AI assistant (ChatGPT, Claude, etc.)
3. **Save the output** to: \`${outputPath}\`
4. **Continue** with the next step in the workflow

### Option 3: Create a Custom Adapter

Create a custom adapter for your environment:

1. **Create adapter file**: \`.ai/adapters/my-adapter.js\`
2. **Implement AgentInvoker interface**:

\`\`\`javascript
export class MyCustomInvoker {
  getName() {
    return 'My Custom Adapter';
  }

  async invoke(prompt, config) {
    // Your implementation here
    // Call your AI assistant's API
    const result = await yourAIService.execute(prompt);

    return {
      output: result,
      error: undefined
    };
  }
}
\`\`\`

3. **Configure it**:
\`\`\`bash
export ORCHESTRATOR_CUSTOM_ADAPTER=".ai/adapters/my-adapter.js"
\`\`\`

### Option 4: Set MCP_RUNTIME Hint

If you're using a known AI assistant, set a hint:

\`\`\`bash
export MCP_RUNTIME=claude-code  # or cursor, copilot, vscode
\`\`\`

---

## 📚 Resources

- **Adapter Documentation**: See \`src/adapters/README.md\`
- **Example Adapters**: Check \`src/adapters/claude-code.ts\`
- **AgentInvoker Interface**: See \`src/adapters/types.ts\`

---

⚠️  **This is a limitation of the Universal adapter in your environment.**

The Universal adapter works best when it can detect your environment.
For automated execution, please use one of the options above.
`;
  }
}
