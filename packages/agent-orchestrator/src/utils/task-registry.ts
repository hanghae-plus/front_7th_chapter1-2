import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * TaskRegistry - Efficient task file lookup by category
 *
 * Tasks are organized in category directories:
 * .ai/tasks/
 *   ├── analysis/
 *   ├── planning/
 *   ├── architecture/
 *   └── ...
 *
 * This registry builds a map of task names to their category paths
 * on first access, enabling O(1) lookups thereafter.
 */
export class TaskRegistry {
  private registry: Map<string, string> | null = null;
  private basePath: string;

  // Task categories matching directory structure
  private readonly categories = [
    'analysis',
    'planning',
    'architecture',
    'implementation',
    'testing',
    'validation',
    'orchestration',
  ];

  constructor(basePath: string = '.ai/tasks') {
    this.basePath = basePath;
  }

  /**
   * Build task registry by scanning category directories
   *
   * This is called lazily on first task lookup.
   * Subsequent lookups use the cached registry.
   */
  private async buildRegistry(): Promise<Map<string, string>> {
    const registry = new Map<string, string>();

    for (const category of this.categories) {
      const categoryPath = join(this.basePath, category);

      try {
        // Read all files in this category directory
        const files = await readdir(categoryPath);

        for (const file of files) {
          // Only process .md files
          if (!file.endsWith('.md')) continue;

          // Extract task name (filename without extension)
          const taskName = file.replace(/\.md$/, '');

          // Store mapping: taskName -> category/taskName
          registry.set(taskName, `${category}/${taskName}`);
        }
      } catch (error) {
        // Category directory might not exist, skip silently
        console.warn(`⚠️  Task category '${category}' directory not found, skipping`);
      }
    }

    console.log(`✅ Task registry built: ${registry.size} tasks indexed`);
    return registry;
  }

  /**
   * Get the full path for a task (category/task-name)
   *
   * @param taskName - Name of the task (e.g., "create-problem-statement")
   * @returns Full path relative to .ai/tasks (e.g., "analysis/create-problem-statement")
   * @throws Error if task not found
   */
  async getTaskPath(taskName: string): Promise<string> {
    // Build registry on first access
    if (!this.registry) {
      this.registry = await this.buildRegistry();
    }

    const taskPath = this.registry.get(taskName);

    if (!taskPath) {
      throw new Error(
        `Task '${taskName}' not found in any category. ` +
        `Available tasks: ${Array.from(this.registry.keys()).join(', ')}`
      );
    }

    return taskPath;
  }

  /**
   * Get the full file path for a task
   *
   * @param taskName - Name of the task
   * @returns Full file path (e.g., ".ai/tasks/analysis/create-problem-statement.md")
   */
  async getTaskFilePath(taskName: string): Promise<string> {
    const taskPath = await this.getTaskPath(taskName);
    return `${this.basePath}/${taskPath}.md`;
  }

  /**
   * Get all registered task names
   */
  async getAllTaskNames(): Promise<string[]> {
    if (!this.registry) {
      this.registry = await this.buildRegistry();
    }

    return Array.from(this.registry.keys());
  }

  /**
   * Get tasks by category
   */
  async getTasksByCategory(category: string): Promise<string[]> {
    if (!this.registry) {
      this.registry = await this.buildRegistry();
    }

    const tasks: string[] = [];
    for (const [taskName, taskPath] of this.registry.entries()) {
      if (taskPath.startsWith(`${category}/`)) {
        tasks.push(taskName);
      }
    }

    return tasks;
  }

  /**
   * Clear the registry cache (useful for testing or hot-reload)
   */
  clearCache(): void {
    this.registry = null;
  }
}
