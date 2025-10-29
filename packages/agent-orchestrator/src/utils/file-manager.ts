import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import YAML from 'yaml';

export class FileManager {
  constructor(private basePath: string = process.cwd()) {}

  /**
   * Read a file and return its content
   */
  async readFile(path: string): Promise<string> {
    const fullPath = join(this.basePath, path);
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }
    return await readFile(fullPath, 'utf-8');
  }

  /**
   * Write content to a file (creates directories if needed)
   */
  async writeFile(path: string, content: string): Promise<void> {
    const fullPath = join(this.basePath, path);
    const dir = dirname(fullPath);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Check if a file exists
   */
  fileExists(path: string): boolean {
    const fullPath = join(this.basePath, path);
    return existsSync(fullPath);
  }

  /**
   * Parse YAML file
   */
  async readYAML<T = any>(path: string): Promise<T> {
    const content = await this.readFile(path);
    return YAML.parse(content) as T;
  }

  /**
   * Write YAML file
   */
  async writeYAML(path: string, data: any): Promise<void> {
    const content = YAML.stringify(data);
    await this.writeFile(path, content);
  }

  /**
   * Resolve variables in a path (e.g., {{featureId}})
   */
  resolvePath(path: string, variables: Record<string, string>): string {
    let resolved = path;
    for (const [key, value] of Object.entries(variables)) {
      resolved = resolved.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return resolved;
  }
}
