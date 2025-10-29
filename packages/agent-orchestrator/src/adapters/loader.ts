/**
 * Adapter Loader
 *
 * Dynamically loads AI adapter implementations.
 *
 * Design Philosophy:
 * - undefined adapter name → Universal adapter (MCP standard, any AI)
 * - Specified adapter name → Vendor-specific optimization
 */

import type { AgentInvoker } from './types.js';

/**
 * Load adapter by name
 *
 * @param adapterName - Optional adapter name. If undefined, uses universal adapter
 * @returns AgentInvoker instance
 */
export async function loadAdapter(adapterName?: string): Promise<AgentInvoker> {
  // If no adapter specified, use universal adapter (MCP standard)
  if (!adapterName) {
    const { UniversalInvoker } = await import('./universal.js');
    return new UniversalInvoker();
  }

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
      console.error(`⚠️  Adapter '${adapterName}' not found, falling back to universal adapter`);
      const { UniversalInvoker } = await import('./universal.js');
      return new UniversalInvoker();
    }
    throw error;
  }
}

/**
 * List available adapters
 */
export async function listAdapters(): Promise<string[]> {
  return ['universal', 'claude-code'];
}
