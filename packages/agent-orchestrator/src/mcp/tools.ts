/**
 * MCP Tools Definition
 *
 * Defines all MCP tools that the orchestrator exposes.
 */

export const tools = [
  {
    name: 'run_workflow',
    description:
      'Run a multi-agent workflow to generate development artifacts (analysis, requirements, architecture, tests, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'string',
          description:
            'Workflow name. Available: tdd_setup (13 steps: complete TDD setup), tdd_cycle (7 steps: Red-Green-Refactor), test_simple (2 steps: quick analysis)',
        },
        featureId: {
          type: 'string',
          description:
            'Feature ID for tracking (e.g., F-123, F-LOGIN, FEAT-001)',
        },
        title: {
          type: 'string',
          description: 'Optional: Feature title or description',
        },
        adapter: {
          type: 'string',
          description:
            'Optional: AI adapter to use (default: claude-code). Options: claude-code, codex',
          enum: ['claude-code', 'codex'],
        },
      },
      required: ['workflow', 'featureId'],
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
