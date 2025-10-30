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

import { resolve, join, dirname } from 'path';
import { existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';

export interface ConfigPaths {
  personas: string[];
  workflows: string[];
  tasks: string[];
  templates: string[];
  data: string;        // Base path for all generated data
  output: string;      // data/output
  runtime: string;     // data/runtime
}

export class ConfigLoader {
  private projectRoot: string;
  private packageRoot: string;
  private dataBasePath: string;

  constructor(workspaceRoot?: string, dataPath?: string) {
    // Project root: where user runs the code (current working directory)
    this.projectRoot = workspaceRoot || process.cwd();

    // Package root: where @agent-orchestrator/mcp is installed
    // ES module equivalent of __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.packageRoot = resolve(__dirname, '../../');

    // Data base path: where all generated data goes
    // Priority: explicit dataPath > package default
    this.dataBasePath = dataPath || resolve(this.packageRoot, '.ai');
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

      // Generated data paths (runtime + output)
      data: this.dataBasePath,
      runtime: resolve(this.dataBasePath, 'runtime'),
      output: resolve(this.dataBasePath, 'output'),
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
   * @param workflowName - Workflow name without extension (e.g., "tdd_setup")
   */
  getWorkflowPath(workflowName: string): string | undefined {
    const paths = this.getPaths();
    const filename = workflowName.endsWith('.yaml') ? workflowName : `${workflowName}.yaml`;
    return this.findFile(paths.workflows, filename);
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
   * Load MCP configuration (OPTIONAL)
   *
   * Zero-config philosophy:
   * - Config file is completely optional
   * - System works with sensible defaults
   * - Only needed for advanced customization
   *
   * Priority: Project config > Package config > Defaults
   */
  async loadMCPConfig(): Promise<Partial<MCPConfig>> {
    const { readFileSync } = await import('fs');

    // Default configuration (zero-config)
    const defaultConfig: Partial<MCPConfig> = {
      adapter: undefined,  // undefined = universal adapter
      output: {
        basePath: '.ai/output/feature',
        format: 'markdown',
      },
      logging: {
        level: 'info',
        file: '.ai/logs/mcp.log',
      },
    };

    try {
      // Try to load project config first (highest priority)
      const projectConfigPath = resolve(this.projectRoot, '.ai/mcp-config.json');
      if (existsSync(projectConfigPath)) {
        const projectConfig = JSON.parse(readFileSync(projectConfigPath, 'utf-8')) as Partial<MCPConfig>;
        return { ...defaultConfig, ...projectConfig };
      }

      // Try to load package config (fallback)
      const packageConfigPath = resolve(this.packageRoot, '.ai/mcp-config.json');
      if (existsSync(packageConfigPath)) {
        const packageConfig = JSON.parse(readFileSync(packageConfigPath, 'utf-8')) as Partial<MCPConfig>;
        return { ...defaultConfig, ...packageConfig };
      }
    } catch (error) {
      // Config file is optional - just use defaults
      console.error('⚠️  Config file error, using defaults:', error);
    }

    // No config file found - use defaults (zero-config)
    return defaultConfig;
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

// MCP Configuration Types (all optional for zero-config)
//
// Philosophy:
// - Config file is completely optional (zero-config by default)
// - Only used for advanced customization
// - Model/temperature controlled by AI settings, not config file
export interface MCPConfig {
  adapter?: {
    default?: string;
    allowed?: string[];
  };
  workflows?: {
    enabled?: string[];
    customPath?: string;
  };
  output?: {
    basePath?: string;
    format?: string;
  };
  logging?: {
    level?: string;
    file?: string;
  };
}
