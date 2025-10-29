/**
 * Adapter Loader
 *
 * Dynamically loads AI adapter implementations.
 *
 * Design Philosophy:
 * - Pure loading logic only
 * - No fallback logic (caller handles that)
 * - Throws errors for missing adapters
 * - undefined adapter name → Universal adapter (default)
 */

import type { AgentInvoker } from './types.js';

/**
 * Load built-in adapter by name
 *
 * @param adapterName - Optional adapter name. If undefined, uses universal adapter
 * @returns AgentInvoker instance
 * @throws Error if adapter not found
 */
export async function loadAdapter(adapterName?: string): Promise<AgentInvoker> {
  // If no adapter specified, use universal adapter (default)
  if (!adapterName) {
    const { UniversalInvoker } = await import('./universal.js');
    return new UniversalInvoker();
  }

  // Try to load built-in adapter from src/adapters/
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
    // Re-throw with clear error message
    // Note: Caller should handle fallback logic
    if ((error as any).code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        `Adapter '${adapterName}' not found in src/adapters/.\n` +
        `Available adapters: ${(await listAdapters()).join(', ')}`
      );
    }
    throw error;
  }
}

/**
 * Load custom adapter from user's workspace
 *
 * @param adapterPath - Relative path from workspace root (e.g., ".ai/adapters/my-adapter.js")
 * @returns AgentInvoker instance
 * @throws Error if adapter not found or invalid
 */
export async function loadCustomAdapter(adapterPath: string): Promise<AgentInvoker> {
  const { resolve } = await import('path');
  const { existsSync } = await import('fs');

  // Resolve path relative to workspace
  const absolutePath = resolve(process.cwd(), adapterPath);

  if (!existsSync(absolutePath)) {
    throw new Error(
      `Custom adapter file not found: ${adapterPath}\n` +
      `Absolute path checked: ${absolutePath}`
    );
  }

  try {
    // Dynamic import from user's workspace
    const module = await import(absolutePath);

    // Look for exported class that implements AgentInvoker
    const InvokerClass = Object.values(module).find(
      (exp: any) =>
        typeof exp === 'function' &&
        exp.prototype?.invoke &&
        exp.prototype?.getName
    ) as new () => AgentInvoker;

    if (!InvokerClass) {
      throw new Error(
        `No valid AgentInvoker implementation found in: ${adapterPath}\n` +
        'Custom adapter must export a class with invoke() and getName() methods.\n' +
        'See src/adapters/README.md for examples.'
      );
    }

    return new InvokerClass();
  } catch (error) {
    if ((error as any).code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        `Failed to import custom adapter: ${adapterPath}\n` +
        'Make sure the file exists and is a valid JavaScript/TypeScript module.'
      );
    }
    throw error;
  }
}

/**
 * Load adapter with automatic fallback strategy
 *
 * This is a convenience function that implements the complete loading strategy:
 * 1. Try custom adapter (if path provided)
 * 2. Try built-in adapter (if name provided)
 * 3. Fall back to universal adapter
 *
 * Always succeeds (universal adapter as final fallback).
 *
 * @param options - Loading options
 * @returns AgentInvoker instance
 */
export async function loadAdapterWithFallback(options: {
  customPath?: string;
  adapterName?: string;
}): Promise<AgentInvoker> {
  const { customPath, adapterName } = options;

  try {
    // Strategy 1: Custom adapter (highest priority)
    if (customPath) {
      console.error(`\n🔌 Loading custom adapter: ${customPath}`);
      const invoker = await loadCustomAdapter(customPath);
      console.error(`!! Custom adapter ready: ${invoker.getName()}\n`);
      return invoker;
    }

    // Strategy 2: Built-in adapter
    if (adapterName) {
      console.error(`\n🔧 Loading adapter: ${adapterName}`);
      const invoker = await loadAdapter(adapterName);
      console.error(`!! Adapter ready: ${invoker.getName()}\n`);
      return invoker;
    }

    // Strategy 3: Universal adapter (default)
    console.error(`\n🔧 Loading universal adapter (default)`);
    const invoker = await loadAdapter();
    console.error(`!! Adapter ready: ${invoker.getName()}\n`);
    return invoker;
  } catch (error) {
    // Final fallback: Universal adapter
    console.error(`!! Failed to load adapter: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Falling back to universal adapter...\n`);
    const invoker = await loadAdapter(); // Universal adapter
    console.error(`!! Fallback adapter ready: ${invoker.getName()}\n`);
    return invoker;
  }
}

/**
 * List available built-in adapters
 */
export async function listAdapters(): Promise<string[]> {
  return ['universal', 'claude-code'];
}
