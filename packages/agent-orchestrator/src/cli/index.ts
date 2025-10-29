#!/usr/bin/env node

/**
 * CLI Entry Point for Agent Orchestrator
 *
 * This file provides the command-line interface for:
 * 1. Running workflows: orchestrator workflow run <name> <featureId> [title]
 * 2. Listing workflows: orchestrator workflow list
 * 3. Interactive persona mode (future): orchestrator persona <name>
 */

import { WorkflowRunner } from '../runners/workflow-runner.js';
import { FileManager } from '../utils/file-manager.js';
import { ExecutableAgentRunner } from '../runtime/executable-agent-runner.js';

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
        console.error(`!! Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n !!Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

async function handleWorkflowCommand(args: string[]) {
  if (args.length === 0) {
    console.error('!! Missing workflow subcommand');
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
      console.error(`!! Unknown workflow subcommand: ${subcommand}`);
      printWorkflowUsage();
      process.exit(1);
  }
}

async function runWorkflow(args: string[]) {
  if (args.length < 2) {
    console.error('!! Missing required arguments: <name> <featureId>');
    printWorkflowUsage();
    process.exit(1);
  }

  const [name, featureId, ...titleParts] = args;
  const title = titleParts.join(' ') || undefined;

  // Use ExecutableAgentRunner which will have Task tool implementation
  const agentRunner = new ExecutableAgentRunner();
  const workflowRunner = new WorkflowRunner(agentRunner);

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
    // Read all workflow files
    const { readdirSync } = await import('fs');
    const { join } = await import('path');

    const workflowsDir = join(process.cwd(), '.ai/workflows');
    const files = readdirSync(workflowsDir).filter((f) => f.endsWith('.yaml'));

    if (files.length === 0) {
      console.log('!! No workflows found in .ai/workflows/\n');
      return;
    }

    // Parse each workflow
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
        console.warn(`!! Failed to parse ${file}`);
      }
    }

    console.log('Usage:');
    console.log('  orchestrator workflow run <name> <featureId> [title]\n');
    console.log('Example:');
    console.log('  orchestrator workflow run tdd_setup F-123 "Date Filter Optimization"\n');
  } catch (error) {
    console.error('!! Failed to list workflows:', error);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Agent Orchestrator CLI

Usage:
  orchestrator <command> [options]

Commands:
  workflow run <name> <featureId> [title]   Run a workflow
  workflow list                              List all workflows
  list | ls                                  List all workflows

Examples:
  orchestrator workflow run tdd_setup F-123 "Date Filter Optimization"
  orchestrator workflow list
  orchestrator ls
`);
}

function printWorkflowUsage() {
  console.log(`
Workflow Commands:

Usage:
  orchestrator workflow <subcommand> [options]

Subcommands:
  run <name> <featureId> [title]   Run a workflow
  list | ls                        List all workflows

Examples:
  orchestrator workflow run tdd_setup F-123 "My Feature"
  orchestrator workflow list
`);
}

main();
