/**
 * Tool Definition type for the manifest-based registration system.
 *
 * Each tool definition includes its name, description, parameter schema,
 * and handler function. The handler returns the raw result object —
 * the server wraps it in JSON.stringify, try-catch, and next-step suggestions.
 */

import type { z } from 'zod';

export interface ToolDefinition {
  /** Tool name (snake_case). */
  name: string;

  /** Description shown to the LLM. */
  description: string;

  /** Zod schema for tool parameters. */
  params: Record<string, z.ZodType>;

  /**
   * Handler function. Receives validated params, returns result object.
   * The server serializes the result and wraps it in error handling.
   */
  handler: (args: Record<string, any>) => any | Promise<any>;
}
