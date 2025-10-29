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
import { loadAdapter } from '../adapters/loader.js';
import { ConfigLoader } from '../utils/config-loader.js';
import { tools } from './tools.js';

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

  try {
    switch (name) {
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

        const adapterName =
          args.adapter ||                                    // 1. Explicit override (per-call)
          adapterFromEnv ||                                 // 2. Environment variable (recommended)
          (await getConfigAdapter()) ||                     // 3. Config file (legacy/optional)
          undefined;                                        // 4. Universal (default)

        if (adapterName) {
          console.error(`\n🔧 Loading optimized adapter: ${adapterName}`);
          console.error(`   (Vendor-specific optimization enabled)`);
        } else {
          console.error(`\n🔧 Loading universal adapter`);
          console.error(`   (MCP standard mode - works with any AI)`);
        }

        const invoker = await loadAdapter(adapterName);
        console.error(`✅ Adapter ready: ${invoker.getName()}\n`);

        const engine = new OrchestratorEngine(invoker, workspaceRoot, dataPath);

        const result = await engine.runWorkflow({
          workflowName: args.workflow,
          featureId: args.featureId,
          title: args.title,
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
          args.workflow,
          args.featureId
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
        const output = await engine.getOutput(args.featureId, args.documentId);

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

    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
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
