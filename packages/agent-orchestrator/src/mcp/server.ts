#!/usr/bin/env node

/**
 * Agent Orchestrator MCP Server
 *
 * Multi-agent workflow orchestration via Model Context Protocol.
 *
 * 🎯 Philosophy: Pragmatic Vendor-Independence
 *
 * This is an AI orchestration system, not a pure data server.
 * We coordinate multiple AI agents, which inherently requires AI-specific code.
 *
 * The Honest Truth:
 * - Pure MCP servers (filesystem, db) don't call AIs - they just provide tools
 * - Agent orchestrators (us) must invoke AIs - we need vendor-specific code
 * - Complete vendor-agnosticism is impossible for AI orchestration
 *
 * Our Approach:
 * ✅ Universal adapter by default (works with any AI via meta-programming)
 * ⚡ Vendor-specific adapters optional (better performance when configured)
 * 🔄 Easy switching via environment variable (never locked in)
 *
 * Why This Design?
 * - Pragmatism over purity: Works everywhere, optimizes when needed
 * - Transparency: We're honest about trade-offs
 * - Flexibility: Switch AIs easily, no vendor lock-in
 *
 * Configuration (via environment variables):
 *
 * Required:
 *   ORCHESTRATOR_WORKSPACE="/path/to/your/project"  # Where to run workflows
 *
 * Optional:
 *   ORCHESTRATOR_ADAPTER="claude-code"              # Adapter selection (default: universal)
 *                                                    # Options: universal | claude-code
 *   ORCHESTRATOR_DATA_PATH="/path/to/data"          # Where to save all generated data
 *                                                    # Default: MCP server internal (.ai/)
 *                                                    # Structure: {path}/runtime/ and {path}/output/
 *
 * Usage Examples:
 *
 * 1. Basic setup (universal adapter, works with any AI):
 *   {
 *     "mcpServers": {
 *       "agent-orchestrator": {
 *         "command": "node",
 *         "args": ["/path/to/agent-orchestrator/dist/mcp/server.js"],
 *         "env": {
 *           "ORCHESTRATOR_WORKSPACE": "/path/to/your/project"
 *         }
 *       }
 *     }
 *   }
 *
 * 2. Optimized for Claude Code (uses Task tool for better persona switching):
 *   {
 *     "mcpServers": {
 *       "agent-orchestrator": {
 *         "command": "node",
 *         "args": ["/path/to/agent-orchestrator/dist/mcp/server.js"],
 *         "env": {
 *           "ORCHESTRATOR_WORKSPACE": "/path/to/your/project",
 *           "ORCHESTRATOR_ADAPTER": "claude-code"
 *         }
 *       }
 *     }
 *   }
 *
 * 3. Export data to workspace (make output visible to users):
 *   {
 *     "mcpServers": {
 *       "agent-orchestrator": {
 *         "command": "node",
 *         "args": ["/path/to/agent-orchestrator/dist/mcp/server.js"],
 *         "env": {
 *           "ORCHESTRATOR_WORKSPACE": "/path/to/your/project",
 *           "ORCHESTRATOR_DATA_PATH": "/path/to/your/project/.ai"
 *         }
 *       }
 *     }
 *   }
 *
 * 4. Per-call override (test different adapters):
 *   > Use run_workflow tool with "adapter" parameter
 *
 * Available Adapters:
 *   - universal (default): Meta-programming for any AI (Cursor, Copilot, GPT, etc.)
 *   - claude-code: Claude Code Task tool (only programmable API)
 *
 * Adapter Priority:
 *   1. Tool argument (explicit per-call)
 *   2. ORCHESTRATOR_ADAPTER env var (recommended)
 *   3. .ai/mcp-config.json (legacy, optional)
 *   4. undefined → universal (default)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { OrchestratorEngine } from '../engine.js';
import { loadAdapterWithFallback } from '../adapters/loader.js';
import { ConfigLoader } from '../utils/config-loader.js';
import { tools } from './tools.js';

/**
 * Type-safe argument extractors
 */
function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  return value;
}

function ensureOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error('Value must be a string if provided');
  }
  return value;
}

function ensureOptionalContext(value: unknown): Record<string, string | string[]> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('context must be an object');
  }
  return value as Record<string, string | string[]>;
}

// Environment variables (primary configuration method)
const workspaceRoot = process.env.ORCHESTRATOR_WORKSPACE || process.cwd();
const dataPath = process.env.ORCHESTRATOR_DATA_PATH; // undefined = MCP server internal
const adapterFromEnv = process.env.ORCHESTRATOR_ADAPTER; // undefined = universal

// Load configuration
const configLoader = new ConfigLoader(workspaceRoot, dataPath);
let mcpConfig: Awaited<ReturnType<typeof configLoader.loadMCPConfig>>;

/**
 * Helper: Get adapter from config file (optional, lowest priority)
 * Returns undefined if config doesn't exist or doesn't specify adapter
 */
async function getConfigAdapter(): Promise<string | undefined> {
  if (!mcpConfig) {
    mcpConfig = await configLoader.loadMCPConfig();
  }
  return mcpConfig?.adapter?.default;
}

// Create MCP server
const server = new Server(
  {
    name: 'agent-orchestrator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Log configuration on startup
const paths = configLoader.getPaths();
console.error('🎼 Agent Orchestrator MCP Server Starting...');
console.error(`   Workspace: ${workspaceRoot}`);
console.error(`   Output: ${paths.output}`);
console.error(`   Adapter: ${adapterFromEnv || 'universal (default)'}`);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [{ type: 'text', text: '❌ Missing arguments' }],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'prepare_workflow': {
        // Get workflow definition and check if interactive context is needed
        const engine = new OrchestratorEngine(null, workspaceRoot, dataPath);

        try {
          const workflowDef = await engine.getWorkflowDefinition(
            ensureString(args.workflow, 'workflow')
          );

          // Check if workflow needs interactive context
          if (!workflowDef.contextConfig?.interactive) {
            // Non-interactive workflow - ready to run immediately
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  ready: true,
                  workflow: args.workflow,
                  message: `✅ ${workflowDef.name} is ready to run (no additional context needed)`
                }, null, 2)
              }]
            };
          }

          // Interactive workflow - return prompts for user
          const prompts = workflowDef.contextConfig.prompts || [];

          let message = `🎯 **${workflowDef.name}** workflow needs additional context\n\n`;
          message += `**Feature**: ${args.featureId}\n`;
          message += `**Request**: ${args.prompt}\n\n`;
          message += `Please provide the following information:\n\n`;

          prompts.forEach((prompt: any, i: number) => {
            const badge = prompt.required ? '🔴 Required' : '🟢 Optional';
            message += `${i + 1}. ${badge} **${prompt.key}**\n`;
            message += `   ${prompt.question}\n`;
            if (prompt.examples && prompt.examples.length > 0) {
              message += `   Examples: ${prompt.examples.join(', ')}\n`;
            }
            message += '\n';
          });

          message += `\nOnce you provide these, call run_workflow with the context parameter.`;
          message += `\n\nIf you don't have this information, you can proceed without it (for optional items).`;

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                ready: false,
                workflow: args.workflow,
                prompts: prompts,
                message: message
              }, null, 2)
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Failed to prepare workflow: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }

      case 'run_workflow': {
        // 🎯 Adapter Selection Priority (Progressive Enhancement):
        // 1. Tool argument     - Explicit per-call override
        // 2. Environment var   - Project/deployment level (ORCHESTRATOR_ADAPTER)
        // 3. Config file       - Optional customization (.ai/mcp-config.json)
        // 4. undefined         - Universal adapter (MCP standard, any AI)
        //
        // This design:
        // ✅ Follows MCP vendor-agnostic principle (default: universal)
        // ✅ Allows optimization when needed (Claude Code Task tool)
        // ✅ Keeps config file optional (zero-config philosophy)

        // Determine adapter with priority: custom > explicit > env > config > default
        const customAdapterPath = process.env.ORCHESTRATOR_CUSTOM_ADAPTER;
        const adapterName: string | undefined =
          ensureOptionalString(args.adapter) ||              // 1. Explicit override (per-call)
          adapterFromEnv ||                                  // 2. Environment variable (recommended)
          (await getConfigAdapter()) ||                      // 3. Config file (legacy/optional)
          undefined;                                         // 4. Universal (default)

        // Load adapter with automatic fallback to universal
        const invoker = await loadAdapterWithFallback({
          customPath: customAdapterPath,
          adapterName: adapterName,
        });

        const engine = new OrchestratorEngine(invoker, workspaceRoot, dataPath);

        // Determine prompt: prioritize args.prompt, fallback to args.title
        let prompt = '';
        try {
          prompt = ensureString(args.prompt, 'prompt');
        } catch {
          // Fallback to title for backward compatibility
          prompt = ensureOptionalString(args.title) || '';
        }

        const result = await engine.runWorkflow({
          workflowName: ensureString(args.workflow, 'workflow'),
          featureId: ensureString(args.featureId, 'featureId'),
          prompt,
          context: ensureOptionalContext(args.context),
          title: ensureOptionalString(args.title),  // Deprecated but keep for compatibility
        }); 

        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: result.summary,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Workflow failed: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'list_workflows': {
        const engine = new OrchestratorEngine(null, workspaceRoot, dataPath);
        const workflows = await engine.listWorkflows();

        const text = workflows
          .map((w) => {
            return `📋 ${w.name}\n   ${w.description || 'No description'}\n   Steps: ${w.steps}\n   Personas: ${w.personas.join(' → ')}`;
          })
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `🎼 Available Workflows\n\n${text}`,
            },
          ],
        };
      }

      case 'get_workflow_status': {
        const engine = new OrchestratorEngine(null, workspaceRoot, dataPath);
        const status = await engine.getWorkflowStatus(
          ensureString(args.workflow, 'workflow'),
          ensureString(args.featureId, 'featureId')
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      case 'list_personas': {
        const engine = new OrchestratorEngine(null, workspaceRoot, dataPath);
        const personas = await engine.listPersonas();

        return {
          content: [
            {
              type: 'text',
              text: `👥 Available Personas\n\n${personas.join(', ')}`,
            },
          ],
        };
      }

      case 'get_output': {
        const engine = new OrchestratorEngine(null, workspaceRoot, dataPath);
        const output = await engine.getOutput(
          ensureString(args.featureId, 'featureId'),
          ensureOptionalString(args.documentId)
        );

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`❌ Tool error:`, error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }

    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error instanceof Error ? error.message : String(error)}${error instanceof Error && error.stack ? '\n\nStack:\n' + error.stack : ''}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Print configuration summary
  const engine = new OrchestratorEngine(null, workspaceRoot, dataPath);
  console.error('\n' + engine.getConfigSummary());

  console.error('\n✅ Agent Orchestrator MCP Server running on stdio\n');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
