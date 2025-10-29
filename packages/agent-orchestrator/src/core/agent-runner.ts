import { FileManager } from '../utils/file-manager.js';
import { PromptBuilder } from './prompt-builder.js';
import { ResultParser } from './result-parser.js';
import type { AgentInvoker } from '../adapters/types.js';
import type {
  AgentConfig,
  AgentResult,
  PersonaDefinition,
  BehaviorDefinition,
} from '../types/index.js';

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

  constructor(private invoker: AgentInvoker, basePath?: string) {
    this.fileManager = new FileManager(basePath);
    this.promptBuilder = new PromptBuilder();
    this.resultParser = new ResultParser();
  }

  /**
   * Run an agent with the specified configuration
   *
   * This method:
   * 1. Loads persona and behavior definitions
   * 2. Builds a complete prompt with context and inputs
   * 3. Calls Claude Code's Task tool to spawn independent agent
   * 4. Parses the result and extracts structured data
   */
  async runAgent(config: AgentConfig): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // 1. Load persona definition
      const persona = await this.loadPersona(config.persona);

      // 2. Load behavior (if specified)
      const behavior = config.behavior
        ? await this.loadBehavior(persona, config.behavior)
        : undefined;

      // 3. Load shared context (if specified)
      const context = config.contextPath
        ? await this.fileManager.readFile(config.contextPath)
        : undefined;

      // 4. Load input files
      const inputs = await this.loadInputFiles(config.inputs || []);

      // 5. Load task content and template (if behavior is specified)
      let taskContent: string | undefined;
      let templateContent: string | undefined;

      if (behavior) {
        taskContent = await this.loadTaskContent(behavior);
        templateContent = await this.loadTemplateContent(behavior);
      }

      // 6. Build prompt
      const prompt = this.promptBuilder.build({
        persona,
        behavior,
        context,
        inputs,
        featureId: config.featureId,
        title: config.title,
        taskContent,
        templateContent,
      });

      // 7. Call AgentInvoker (vendor-specific implementation)
      console.log(
        `!! Spawning agent via ${this.invoker.getName()}: ${config.persona}${
          config.behavior ? `.${config.behavior}` : ''
        }`
      );
      const invokerResult = await this.invoker.invoke(prompt, {
        persona: config.persona,
        behavior: config.behavior,
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
    const path = `.ai/personas/${personaName}.md`;
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
   * Load behavior definition from persona
   */
  private async loadBehavior(
    persona: PersonaDefinition,
    behaviorId: string
  ): Promise<BehaviorDefinition> {
    const behavior = persona.behavior[behaviorId];
    if (!behavior) {
      throw new Error(`Behavior '${behaviorId}' not found in persona '${persona.agent.title}'`);
    }
    return behavior;
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
   * Load task content from behavior.load
   */
  private async loadTaskContent(behavior: BehaviorDefinition): Promise<string | undefined> {
    if (!behavior.load) return undefined;

    const taskFiles = behavior.load.filter((f) => f.startsWith('tasks/'));
    if (taskFiles.length === 0) return undefined;

    const contents: string[] = [];
    for (const file of taskFiles) {
      try {
        const content = await this.fileManager.readFile(`.ai/${file}`);
        contents.push(content);
      } catch (error) {
        console.warn(`!!  Failed to load task file: ${file}`);
      }
    }

    return contents.join('\n\n');
  }

  /**
   * Load template content from behavior.load
   */
  private async loadTemplateContent(behavior: BehaviorDefinition): Promise<string | undefined> {
    if (!behavior.load) return undefined;

    const templateFiles = behavior.load.filter((f) => f.startsWith('templates/'));
    if (templateFiles.length === 0) return undefined;

    const contents: string[] = [];
    for (const file of templateFiles) {
      try {
        const content = await this.fileManager.readFile(`.ai/${file}`);
        contents.push(content);
      } catch (error) {
        console.warn(`!!  Failed to load template file: ${file}`);
      }
    }

    return contents.join('\n\n');
  }
}
