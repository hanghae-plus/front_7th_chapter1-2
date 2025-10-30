import { FileManager } from '../utils/file-manager.js';
import { PromptBuilder } from './prompt-builder.js';
import { ResultParser } from './result-parser.js';
import { ConfigLoader } from '../utils/config-loader.js';
import type { AgentInvoker } from '../adapters/types.js';
import type {
  AgentConfig,
  AgentResult,
  PersonaDefinition,
} from '../types/index.js';
import type { TaskMetadata } from '../schema/task.schema.js';
import matter from 'gray-matter';

/**
 * AgentRunner - Vendor-agnostic core class for executing AI agents
 *
 * This is the fundamental building block that enables:
 * 1. Persona switching via AgentInvoker (vendor-specific)
 * 2. File-based context coordination
 * 3. Structured output generation
 *
 * The AgentRunner is vendor-agnostic - it works with any AI by
 * accepting an AgentInvoker implementation in the constructor.
 */
export class AgentRunner {
  private fileManager: FileManager;
  private promptBuilder: PromptBuilder;
  private resultParser: ResultParser;
  private configLoader: ConfigLoader;

  constructor(private invoker: AgentInvoker, basePath?: string, configLoader?: ConfigLoader) {
    this.fileManager = new FileManager(basePath);
    this.promptBuilder = new PromptBuilder();
    this.resultParser = new ResultParser();
    this.configLoader = configLoader || new ConfigLoader();
  }

  /**
   * Run an agent with the specified configuration
   *
   * This method:
   * 1. Loads persona and task definitions
   * 2. Builds a complete prompt with context and inputs
   * 3. Calls Claude Code's Task tool to spawn independent agent
   * 4. Parses the result and extracts structured data
   */
  async runAgent(config: AgentConfig): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // 1. Load persona definition
      const persona = await this.loadPersona(config.persona);

      // 2. Load task definition
      const task = await this.loadTask(config.task);

      // 3. Load shared context (if specified)
      const context = config.contextPath
        ? await this.fileManager.readFile(config.contextPath)
        : undefined;

      // 4. Load input files
      const inputs = await this.loadInputFiles(config.inputs || []);

      // 5. Load task content and template
      const taskContent = task.content;
      const templateContent = task.metadata.template
        ? await this.loadTemplate(task.metadata.template)
        : undefined;

      // 6. Build prompt
      const prompt = this.promptBuilder.build({
        persona,
        task: task.metadata,
        context,
        inputs,
        featureId: config.featureId,
        title: config.title,
        taskContent,
        templateContent,
      });

      // 7. Call AgentInvoker (vendor-specific implementation)
      console.log(
        `🤖 Spawning agent via ${this.invoker.getName()}: ${config.persona}.${config.task}`
      );
      const invokerResult = await this.invoker.invoke(prompt, {
        persona: config.persona,
        task: config.task,
        featureId: config.featureId,
        title: config.title,
      });

      if (invokerResult.error) {
        throw new Error(invokerResult.error);
      }

      const result = invokerResult.output;

      // 8. Parse result
      const parsed = this.resultParser.parse(result);

      // 9. Validate context update (if present)
      if (parsed.contextUpdate) {
        const validation = this.resultParser.validateContextUpdate(parsed.contextUpdate);
        if (!validation.valid) {
          console.warn('!!  Context update validation warnings:');
          validation.errors.forEach((err) => console.warn(`  - ${err}`));
        }
      }

      const duration = Date.now() - startTime;

      return {
        output: result,
        outputFiles: parsed.outputFiles,
        contextUpdate: parsed.contextUpdate,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        output: '',
        outputFiles: [],
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Load persona definition from .ai/personas/{persona}.md
   */
  private async loadPersona(personaName: string): Promise<PersonaDefinition> {
    const path = this.configLoader.getPersonaPath(personaName);
    if (!path) {
      throw new Error(`Persona '${personaName}' not found`);
    }
    const content = await this.fileManager.readFile(path);

    // Extract YAML block from markdown
    const yamlMatch = content.match(/```yaml\s*\n([\s\S]*?)\n```/);
    if (!yamlMatch) {
      throw new Error(`No YAML block found in persona: ${path}`);
    }

    const rawPersona = await import('yaml').then((m) => m.parse(yamlMatch[1]));

    // Validate persona schema
    try {
      const { safeValidatePersona } = await import('../schema/persona.schema.js');
      const validation = safeValidatePersona(rawPersona);

      if (!validation.success) {
        console.warn(`⚠️  Persona schema validation failed for '${personaName}': ${validation.error}`);
        console.warn(`   Continuing with unvalidated persona...`);
      } else {
        console.log(`✅ Persona schema validation passed: ${personaName}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not validate persona schema: ${error instanceof Error ? error.message : String(error)}`);
    }

    return rawPersona as PersonaDefinition;
  }

  /**
   * Load task definition from flat tasks directory
   */
  private async loadTask(taskName: string): Promise<{ metadata: TaskMetadata; content: string }> {
    // Use ConfigLoader to find task file (supports cascading)
    const path = this.configLoader.getTaskPath(taskName);
    if (!path) {
      throw new Error(`Task '${taskName}' not found`);
    }
    const content = await this.fileManager.readFile(path);

    // Parse frontmatter
    const parsed = matter(content);

    if (!parsed.data || !parsed.data.task) {
      throw new Error(`Task file ${path} has no frontmatter or task field`);
    }

    // Validate task metadata
    try {
      const { safeValidateTaskMetadata } = await import('../schema/task.schema.js');
      const validation = safeValidateTaskMetadata(parsed.data);

      if (!validation.success) {
        console.warn(`⚠️  Task schema validation failed for '${taskName}': ${validation.error}`);
        console.warn(`   Continuing with unvalidated task...`);
      } else {
        console.log(`✅ Task schema validation passed: ${taskName}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not validate task schema: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      metadata: parsed.data as TaskMetadata,
      content: parsed.content,
    };
  }

  /**
   * Load input files specified in the config
   */
  private async loadInputFiles(paths: string[]): Promise<Array<{ name: string; content: string }>> {
    const inputs: Array<{ name: string; content: string }> = [];

    for (const path of paths) {
      try {
        const content = await this.fileManager.readFile(path);
        const name = path.split('/').pop() || path;
        inputs.push({ name, content });
      } catch (error) {
        console.warn(`!!  Failed to load input file: ${path}`);
      }
    }

    return inputs;
  }

  /**
   * Load template content from task metadata
   */
  private async loadTemplate(templatePath: string): Promise<string | undefined> {
    try {
      // Template path from task metadata is relative to .ai/ (e.g., "templates/analysis/problem-statement.tmpl.md")
      const path = this.configLoader.getTemplatePath(templatePath.replace(/^templates\//, ''));
      if (!path) {
        console.warn(`⚠️  Template '${templatePath}' not found`);
        return undefined;
      }
      const content = await this.fileManager.readFile(path);
      return content;
    } catch (error) {
      console.warn(`⚠️  Failed to load template file: ${templatePath}`);
      return undefined;
    }
  }
}
