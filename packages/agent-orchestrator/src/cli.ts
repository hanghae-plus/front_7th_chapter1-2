#!/usr/bin/env node

/**
 * Universal Orchestrator CLI
 *
 * This CLI dynamically loads the appropriate adapter based on:
 * 1. --adapter flag (explicit)
 * 2. ORCHESTRATOR_ADAPTER environment variable
 * 3. Default to Claude Code
 *
 * Usage:
 *   npm run workflow run tdd_setup F-123 "My Feature"
 *   npm run workflow run tdd_setup F-123 "My Feature" --adapter codex
 *   ORCHESTRATOR_ADAPTER=codex npm run workflow run tdd_setup F-123
 */

import { AgentRunner } from './core/agent-runner.js';
import { WorkflowRunner } from './runners/workflow-runner.js';
import { FileManager } from './utils/file-manager.js';
import type { AgentInvoker } from './adapters/types.js';

/**
 * Dynamically load adapter based on name
 */
async function loadAdapter(adapterName: string): Promise<AgentInvoker> {
  try {
    const module = await import(`./adapters/${adapterName}.js`);

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
 * Get adapter name from args or environment
 */
function getAdapterName(args: string[]): { adapter: string; cleanArgs: string[] } {
  // Check for --adapter flag
  const adapterFlagIndex = args.indexOf('--adapter');
  if (adapterFlagIndex !== -1 && args[adapterFlagIndex + 1]) {
    const adapter = args[adapterFlagIndex + 1];
    const cleanArgs = [
      ...args.slice(0, adapterFlagIndex),
      ...args.slice(adapterFlagIndex + 2),
    ];
    return { adapter, cleanArgs };
  }

  // Check environment variable
  const envAdapter = process.env.ORCHESTRATOR_ADAPTER;
  if (envAdapter) {
    return { adapter: envAdapter, cleanArgs: args };
  }

  // Default to claude-code
  return { adapter: 'claude-code', cleanArgs: args };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'workflow':
        await handleWorkflowCommand(args.slice(1));
        break;

      case 'list':
      case 'ls':
        await handleListCommand();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n!! Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

async function handleWorkflowCommand(args: string[]) {
  if (args.length === 0) {
    console.error('Missing workflow subcommand');
    printWorkflowUsage();
    process.exit(1);
  }

  const subcommand = args[0];

  switch (subcommand) {
    case 'run':
      await runWorkflow(args.slice(1));
      break;

    case 'list':
    case 'ls':
      await handleListCommand();
      break;

    default:
      console.error(`Unknown workflow subcommand: ${subcommand}`);
      printWorkflowUsage();
      process.exit(1);
  }
}

async function runWorkflow(args: string[]) {
  // Extract adapter name
  const { adapter, cleanArgs } = getAdapterName(args);

  if (cleanArgs.length < 2) {
    console.error('Missing required arguments: <name> <featureId>');
    printWorkflowUsage();
    process.exit(1);
  }

  const [name, featureId, ...titleParts] = cleanArgs;
  const title = titleParts.join(' ') || undefined;

  // Load adapter dynamically
  console.log(`\n🔧 Loading adapter: ${adapter}\n`);
  const invoker = await loadAdapter(adapter);
  console.log(`✅ Adapter loaded: ${invoker.getName()}\n`);

  // Create AgentRunner with loaded adapter
  const agentRunner = new AgentRunner(invoker);

  // Create WorkflowRunner
  const workflowRunner = new WorkflowRunner(agentRunner);

  // Run the workflow
  await workflowRunner.run({
    workflowName: name,
    featureId,
    title,
  });
}

async function handleListCommand() {
  const fileManager = new FileManager();

  console.log('\n🎼 Available Workflows\n');

  try {
    const { readdirSync } = await import('fs');
    const { join } = await import('path');

    const workflowsDir = join(process.cwd(), '.ai/workflows');
    const files = readdirSync(workflowsDir).filter((f) => f.endsWith('.yaml'));

    if (files.length === 0) {
      console.log('No workflows found in .ai/workflows/\n');
      return;
    }

    for (const file of files) {
      const name = file.replace('.yaml', '');
      const path = `.ai/workflows/${file}`;

      try {
        const workflow = await fileManager.readYAML<any>(path);
        const stepCount = workflow.steps?.length || 0;
        const personas = workflow.steps
          ? [...new Set(workflow.steps.map((s: any) => s.persona))].join(' → ')
          : 'N/A';

        console.log(`📋 ${name}`);
        if (workflow.description) {
          console.log(`   ${workflow.description}`);
        }
        console.log(`   Steps: ${stepCount}`);
        console.log(`   Personas: ${personas}\n`);
      } catch (error) {
        console.warn(`⚠️  Failed to parse ${file}`);
      }
    }

    console.log('Usage:');
    console.log('  npm run workflow run <name> <featureId> [title] [--adapter <name>]\n');
    console.log('Examples:');
    console.log('  npm run workflow run tdd_setup F-123 "Date Filter Optimization"');
    console.log('  npm run workflow run tdd_setup F-123 "My Feature" --adapter codex');
    console.log('  ORCHESTRATOR_ADAPTER=codex npm run workflow run tdd_setup F-123\n');
    console.log('Available Adapters:');
    console.log('  - claude-code (default) - Claude Code Task tool');
    console.log('  - codex                 - OpenAI Codex/ChatGPT\n');
  } catch (error) {
    console.error('Failed to list workflows:', error);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Claude Code Orchestrator

Usage:
  npm run claude-code <command> [options]

Commands:
  workflow run <name> <featureId> [title] [--adapter <name>]
                                         Run a workflow with specified adapter
  workflow list                          List all workflows
  list | ls                              List all workflows

Adapter Selection (in order of precedence):
  1. --adapter flag:        npm run workflow run ... --adapter codex
  2. Environment variable:  ORCHESTRATOR_ADAPTER=codex npm run workflow run ...
  3. Default:               claude-code

Examples:
  npm run workflow run tdd_setup F-123 "Date Filter Optimization"
  npm run workflow run tdd_setup F-123 "My Feature" --adapter codex
  npm run list
`);
}

function printWorkflowUsage() {
  console.log(`
Workflow Commands:

Usage:
  npm run workflow <subcommand> [options]

Subcommands:
  run <name> <featureId> [title] [--adapter <name>]
                                   Run a workflow
  list | ls                        List all workflows

Examples:
  npm run workflow run tdd_setup F-123 "My Feature"
  npm run workflow run tdd_setup F-123 "My Feature" --adapter codex
  npm run workflow list
`);
}

main();
