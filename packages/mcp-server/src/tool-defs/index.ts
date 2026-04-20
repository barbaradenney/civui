/**
 * Tool definitions index — aggregates all categorized tool definitions.
 */

export type { ToolDefinition } from './types.js';

import { PARSING_TOOLS } from './parsing.js';
import { GENERATION_TOOLS } from './generation.js';
import { VALIDATION_TOOLS } from './validation.js';
import { TESTING_TOOLS } from './testing.js';
import { CONTENT_TOOLS } from './content.js';
import { UTILITY_TOOLS } from './utility.js';
import { WORKFLOW_TOOLS } from './workflow.js';
import { FEATURES_TOOLS } from './features.js';
import { GOV_FORMS_TOOLS } from './gov-forms.js';

export const ALL_TOOL_DEFS = [
  ...PARSING_TOOLS,
  ...GENERATION_TOOLS,
  ...VALIDATION_TOOLS,
  ...TESTING_TOOLS,
  ...CONTENT_TOOLS,
  ...UTILITY_TOOLS,
  ...WORKFLOW_TOOLS,
  ...FEATURES_TOOLS,
  ...GOV_FORMS_TOOLS,
];
