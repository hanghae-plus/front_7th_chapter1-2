/**
 * MCP Tools Definition
 *
 * Defines all MCP tools that the orchestrator exposes.
 */

export const tools = [
  {
    name: 'prepare_workflow',
    description: `Prepare a workflow by checking what additional context is needed.

This tool analyzes the workflow definition and returns what inputs/context the workflow needs.
Use this BEFORE run_workflow to gather necessary context from the user.

WORKFLOW-SPECIFIC BEHAVIOR:
- If workflow.context.interactive = true: Returns prompts to ask user
- If workflow.context.interactive = false: Returns ready=true (proceed directly)

EXAMPLE FLOW:
1. User: "F-123 login TDD setup"
2. Call prepare_workflow → Returns prompts
3. Ask user the prompts
4. User answers
5. Call run_workflow with collected context`,
    inputSchema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'string',
          description: 'Workflow name (e.g., tdd_setup, tdd_cycle, refactor)',
        },
        featureId: {
          type: 'string',
          description: 'Feature ID for context (e.g., F-123)',
        },
        prompt: {
          type: 'string',
          description: "User's natural language request (for context)",
        },
      },
      required: ['workflow', 'featureId', 'prompt'],
    },
  },

  {
    name: 'run_workflow',
    description: `Execute a multi-agent workflow with optional context.

IMPORTANT: For complex workflows, call prepare_workflow FIRST to check if additional context is needed.

PARAMETERS:
- prompt: User's natural language description (required)
- context: Key-value pairs collected from prepare_workflow prompts (optional)

EXAMPLE:
After prepare_workflow returned prompts and user answered:
{
  "workflow": "tdd_setup",
  "featureId": "F-123",
  "prompt": "Login feature with OAuth 2.0",
  "context": {
    "existing_code": ["src/services/UserService.ts"],
    "requirements": [".ai/features/F-123/spec.md"]
  }
}`,
    inputSchema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'string',
          description: 'Workflow name',
        },
        featureId: {
          type: 'string',
          description: 'Feature ID',
        },
        prompt: {
          type: 'string',
          description: "User's natural language request describing what to build/test",
        },
        context: {
          type: 'object',
          description: 'Optional: Context collected from prepare_workflow prompts. Keys match prompt.key from workflow definition.',
          additionalProperties: {
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } },
            ],
          },
        },
        adapter: {
          type: 'string',
          description: 'Optional: AI adapter (universal | claude-code)',
        },
      },
      required: ['workflow', 'featureId', 'prompt'],
    },
  },

  {
    name: 'list_workflows',
    description: 'List all available workflows with their descriptions',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'get_workflow_status',
    description:
      'Get the current status of a workflow execution (steps completed, current step, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'string',
          description: 'Workflow name',
        },
        featureId: {
          type: 'string',
          description: 'Feature ID',
        },
      },
      required: ['workflow', 'featureId'],
    },
  },

  {
    name: 'list_personas',
    description:
      'List all available agent personas (analyst, pm, architect, qa, dev, etc.)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'get_output',
    description: 'Get generated output documents for a feature',
    inputSchema: {
      type: 'object',
      properties: {
        featureId: {
          type: 'string',
          description: 'Feature ID',
        },
        documentId: {
          type: 'string',
          description:
            'Optional: Specific document ID (e.g., 01_problem, 02_requirements). If not provided, lists all documents.',
        },
      },
      required: ['featureId'],
    },
  },
];
