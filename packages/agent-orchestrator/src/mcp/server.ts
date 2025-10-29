#!/usr/bin/env node

/**
 * Agent Orchestrator MCP Server
 *
 * Exposes multi-agent workflow orchestration via Model Context Protocol.
 *
 * Usage:
 *   Add to claude_desktop_config.json:
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

// Get workspace root from environment or use current directory
const workspaceRoot = process.env.ORCHESTRATOR_WORKSPACE || process.cwd();

// Load configuration
// const configLoader = new ConfigLoader(workspaceRoot);
// let mcpConfig: Awaited<ReturnType<typeof configLoader.loadMCPConfig>>;

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
console.error('🎼 Agent Orchestrator MCP Server Starting...');
console.error(`   Workspace: ${workspaceRoot}`);

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
        // Load config if not loaded yet
        // if (!mcpConfig) {
        //   mcpConfig = await configLoader.loadMCPConfig();
        // }

        // const adapterName = args.adapter || mcpConfig.adapter.default;
        const adapterName = args?.adapter || 'claude-code';

        console.error(`\n🔧 Loading adapter: ${adapterName}`);
        const invoker = await loadAdapter(adapterName as string);

        // Configure adapter with model settings
        if (invoker.configure) {
          // const modelConfig =
          //   adapterName === 'claude-code'
          //     ? mcpConfig.model.claude
          //     : mcpConfig.model.openai;

          const modelConfig = {
            name: 'claude-3.5-sonnet',
            temperature: 0.7,
            maxTokens: 2000,
          };

          invoker.configure({
            model: modelConfig.name,
            temperature: modelConfig.temperature,
            maxTokens: modelConfig.maxTokens,
          });
        }

        console.error(`✅ Adapter loaded: ${invoker.getName()}\n`);

        const engine = new OrchestratorEngine(invoker, workspaceRoot);

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
        const engine = new OrchestratorEngine(null, workspaceRoot);
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
        const engine = new OrchestratorEngine(null, workspaceRoot);
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
        const engine = new OrchestratorEngine(null, workspaceRoot);
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
        const engine = new OrchestratorEngine(null, workspaceRoot);
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
  const engine = new OrchestratorEngine(null, workspaceRoot);
  console.error('\n' + engine.getConfigSummary());

  console.error('\n✅ Agent Orchestrator MCP Server running on stdio\n');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
