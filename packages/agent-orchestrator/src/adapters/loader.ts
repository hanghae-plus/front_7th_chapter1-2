/**
 * Adapter Loader
 *
 * Dynamically loads AI adapter implementations.
 * Used by both CLI and MCP server.
 */

import type { AgentInvoker } from './types.js';

/**
 * Load adapter by name
 */
export async function loadAdapter(adapterName: string): Promise<AgentInvoker> {
  try {
    const module = await import(`./${adapterName}.js`);

    // Look for exported class that ends with "Invoker"
    const invokerClass = Object.values(module).find(
      (exp: any) => typeof exp === 'function' && exp.name.endsWith('Invoker')
    ) as new () => AgentInvoker;

    if (!invokerClass) {
      throw new Error(`No Invoker class found in adapter: ${adapterName}`);
    }

    return new invokerClass();
  } catch (error) {
    if ((error as any).code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        `Adapter '${adapterName}' not found. Available adapters:\n` +
          `  - claude-code (default)\n` +
          `  - codex\n\n` +
          `Create custom adapters in src/adapters/`
      );
    }
    throw error;
  }
}

/**
 * List available adapters
 */
export async function listAdapters(): Promise<string[]> {
  return ['claude-code', 'codex'];
}
