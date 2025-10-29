/**
 * Config Loader - Cascading Configuration System
 *
 * Priority (highest to lowest):
 * 1. Project-level .ai/ (user customization)
 * 2. Package-level .ai/ (defaults)
 *
 * This allows users to:
 * - Use package defaults immediately (zero-config)
 * - Override only what they need (selective customization)
 * - Keep customizations in their project repo
 */

import { resolve, join } from 'path';
import { existsSync, readdirSync } from 'fs';

export interface ConfigPaths {
  personas: string[];
  workflows: string[];
  tasks: string[];
  templates: string[];
  output: string;
}

export class ConfigLoader {
  private projectRoot: string;
  private packageRoot: string;

  constructor(workspaceRoot?: string) {
    // Project root: where user runs the code (current working directory)
    this.projectRoot = workspaceRoot || process.cwd();

    // Package root: where @agent-orchestrator/mcp is installed
    this.packageRoot = resolve(__dirname, '../../');
  }

  /**
   * Get all configuration paths with cascading priority
   */
  getPaths(): ConfigPaths {
    const projectAiDir = resolve(this.projectRoot, '.ai');
    const packageAiDir = resolve(this.packageRoot, '.ai');

    return {
      // Personas: package defaults + project additions
      personas: [
        resolve(packageAiDir, 'personas'),
        ...(existsSync(resolve(projectAiDir, 'personas'))
          ? [resolve(projectAiDir, 'personas')]
          : []),
      ],

      // Workflows: package defaults + project additions
      workflows: [
        resolve(packageAiDir, 'workflows'),
        ...(existsSync(resolve(projectAiDir, 'workflows'))
          ? [resolve(projectAiDir, 'workflows')]
          : []),
      ],

      // Tasks: package defaults + project additions
      tasks: [
        resolve(packageAiDir, 'tasks'),
        ...(existsSync(resolve(projectAiDir, 'tasks'))
          ? [resolve(projectAiDir, 'tasks')]
          : []),
      ],

      // Templates: package defaults + project additions
      templates: [
        resolve(packageAiDir, 'templates'),
        ...(existsSync(resolve(projectAiDir, 'templates'))
          ? [resolve(projectAiDir, 'templates')]
          : []),
      ],

      // Output: always in project directory
      output: resolve(projectAiDir, 'output'),
    };
  }

  /**
   * List all available workflows (from all sources)
   */
  listWorkflows(): string[] {
    const paths = this.getPaths();
    const workflows = new Set<string>();

    for (const workflowDir of paths.workflows) {
      if (!existsSync(workflowDir)) continue;

      const files = readdirSync(workflowDir).filter((f) => f.endsWith('.yaml'));

      for (const file of files) {
        workflows.add(file.replace('.yaml', ''));
      }
    }

    return Array.from(workflows).sort();
  }

  /**
   * List all available personas (from all sources)
   */
  listPersonas(): string[] {
    const paths = this.getPaths();
    const personas = new Set<string>();

    for (const personaDir of paths.personas) {
      if (!existsSync(personaDir)) continue;

      const files = readdirSync(personaDir).filter((f) => f.endsWith('.md'));

      for (const file of files) {
        personas.add(file.replace('.md', ''));
      }
    }

    return Array.from(personas).sort();
  }

  /**
   * Find a file from cascading paths
   * Returns the first match (project overrides package)
   */
  findFile(paths: string[], filename: string): string | undefined {
    // Search in reverse order (project first, then package)
    for (let i = paths.length - 1; i >= 0; i--) {
      const fullPath = join(paths[i], filename);
      if (existsSync(fullPath)) {
        return fullPath;
      }
    }
    return undefined;
  }

  /**
   * Get persona file path
   */
  getPersonaPath(personaName: string): string | undefined {
    const paths = this.getPaths();
    return this.findFile(paths.personas, `${personaName}.md`);
  }

  /**
   * Get workflow file path
   */
  getWorkflowPath(workflowName: string): string | undefined {
    const paths = this.getPaths();
    return this.findFile(paths.workflows, `${workflowName}.yaml`);
  }

  /**
   * Get task file path
   */
  getTaskPath(taskName: string): string | undefined {
    const paths = this.getPaths();
    return this.findFile(paths.tasks, `${taskName}.md`);
  }

  /**
   * Get template file path
   */
  getTemplatePath(templateName: string): string | undefined {
    const paths = this.getPaths();
    return this.findFile(paths.templates, `${templateName}.md`);
  }

  /**
   * Load MCP configuration
   * Project config overrides package config
   */
  async loadMCPConfig(): Promise<MCPConfig> {
    const { readFileSync } = await import('fs');

    // Load package default config
    const packageConfigPath = resolve(this.packageRoot, '.ai/mcp-config.json');
    const packageConfig = JSON.parse(readFileSync(packageConfigPath, 'utf-8')) as MCPConfig;

    // Try to load project config
    const projectConfigPath = resolve(this.projectRoot, '.ai/mcp-config.json');
    if (existsSync(projectConfigPath)) {
      const projectConfig = JSON.parse(readFileSync(projectConfigPath, 'utf-8')) as Partial<MCPConfig>;

      // Deep merge
      return {
        adapter: { ...packageConfig.adapter, ...projectConfig.adapter },
        model: { ...packageConfig.model, ...projectConfig.model },
        workflows: { ...packageConfig.workflows, ...projectConfig.workflows },
        output: { ...packageConfig.output, ...projectConfig.output },
        logging: { ...packageConfig.logging, ...projectConfig.logging },
      };
    }

    return packageConfig;
  }

  /**
   * Get configuration summary for logging
   */
  getSummary(): string {
    const paths = this.getPaths();
    const workflows = this.listWorkflows();
    const personas = this.listPersonas();

    return `
📦 Agent Orchestrator Configuration

Workspace: ${this.projectRoot}
Package: ${this.packageRoot}

Available Resources:
  Workflows: ${workflows.length} (${workflows.join(', ')})
  Personas: ${personas.length} (${personas.join(', ')})

Paths:
  Personas: ${paths.personas.map((p) => `\n    - ${p}`).join('')}
  Workflows: ${paths.workflows.map((p) => `\n    - ${p}`).join('')}
  Output: ${paths.output}

Customization:
  ${existsSync(resolve(this.projectRoot, '.ai')) ? '✅ Project .ai/ folder detected (using custom configuration)' : '📦 Using package defaults (create .ai/ folder to customize)'}
`.trim();
  }
}

// MCP Configuration Types
export interface MCPConfig {
  adapter: {
    default: string;
    allowed: string[];
  };
  model: {
    claude: ModelConfig;
    openai: ModelConfig;
  };
  workflows: {
    enabled: string[];
    customPath: string;
  };
  output: {
    basePath: string;
    format: string;
  };
  logging: {
    level: string;
    file: string;
  };
}

export interface ModelConfig {
  name: string;
  temperature: number;
  maxTokens: number;
}
