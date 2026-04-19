/**
 * Tool definitions index — aggregates all categorized tool definitions.
 */

export type { ToolDefinition } from './types.js';
import { VALIDATION_TOOLS } from './validation.js';

export const ALL_TOOL_DEFS = [
  ...VALIDATION_TOOLS,
];
