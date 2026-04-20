import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
  TAILWIND_REFERENCE,
  FORM_TEMPLATES,
  CHANGELOG,
  DECISION_TREE,
  COMPLEX_PATTERNS,
  WORKFLOW_PATTERNS,
  SCHEMA_REFERENCE,
  AI_GUIDE,
  QUICK_START,
} from './resources/index.js';
import {
  CONVERT_LEGACY_FORM_NAME,
  CONVERT_LEGACY_FORM_DESCRIPTION,
  convertLegacyFormPrompt,
  BUILD_GOVERNMENT_FORM_NAME,
  BUILD_GOVERNMENT_FORM_DESCRIPTION,
  buildGovernmentFormPrompt,
  AUDIT_508_COMPLIANCE_NAME,
  AUDIT_508_COMPLIANCE_DESCRIPTION,
  audit508CompliancePrompt,
  ADD_FIELD_NAME,
  ADD_FIELD_DESCRIPTION,
  FIELD_TYPES,
  addFieldPrompt,
  MIGRATE_FORM_NAME,
  MIGRATE_FORM_DESCRIPTION,
  migrateFormPrompt,
  REVIEW_FORM_UX_NAME,
  REVIEW_FORM_UX_DESCRIPTION,
  reviewFormUxPrompt,
  CONDITIONAL_FORM_NAME,
  CONDITIONAL_FORM_DESCRIPTION,
  conditionalFormPrompt,
  BUILD_COMPLEX_FORM_NAME,
  BUILD_COMPLEX_FORM_DESCRIPTION,
  buildComplexFormPrompt,
  BUILD_WORKFLOW_FORM_NAME,
  BUILD_WORKFLOW_FORM_DESCRIPTION,
  buildWorkflowFormPrompt,
} from './prompts/index.js';

export async function createServer(): Promise<McpServer> {
  const server = new McpServer({
    name: 'civui-form-converter',
    version: '0.1.0',
  });

  server.resource('component-catalog', 'civui://catalog', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: COMPONENT_CATALOG,
      },
    ],
  }));

  server.resource('government-patterns', 'civui://gov-patterns', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: GOVERNMENT_PATTERNS,
      },
    ],
  }));

  server.resource('tailwind-reference', 'civui://tailwind', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: TAILWIND_REFERENCE,
      },
    ],
  }));

  server.resource('form-templates', 'civui://templates', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: FORM_TEMPLATES,
      },
    ],
  }));

  server.resource('changelog', 'civui://changelog', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: CHANGELOG,
      },
    ],
  }));

  server.resource('decision-tree', 'civui://decision-tree', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: DECISION_TREE,
      },
    ],
  }));

  server.resource('complex-patterns', 'civui://complex-patterns', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: COMPLEX_PATTERNS,
      },
    ],
  }));

  server.resource('workflow-patterns', 'civui://workflow-patterns', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: WORKFLOW_PATTERNS,
      },
    ],
  }));

  server.resource('schema-reference', 'civui://schema-reference', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: SCHEMA_REFERENCE,
      },
    ],
  }));

  server.resource('ai-guide', 'civui://ai-guide', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: AI_GUIDE,
      },
    ],
  }));

  server.resource('quick-start', 'civui://quick-start', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: QUICK_START,
      },
    ],
  }));

  // --- Tool Tier Filtering ---
  // Set CIV_MCP_TIER=essential (12 tools) or standard (~35) or all (default, ~80)

  const tierMode = process.env.CIV_MCP_TIER || 'all';

  // Import registry and workflow helpers
  const { getToolInfo } = await import('./tool-registry.js');
  const { getNextSteps } = await import('./tool-workflow.js');

  /** Append next-step suggestions to a tool result. */
  function withNextSteps(toolName: string, resultText: string, context?: { hasErrors?: boolean; format?: string }): string {
    const steps = getNextSteps(toolName, context);
    if (steps.length === 0) return resultText;

    const parsed = JSON.parse(resultText);
    parsed._nextSteps = steps;
    return JSON.stringify(parsed, null, 2);
  }

  /** Only register a tool if it passes the tier filter. */
  function shouldRegister(toolName: string): boolean {
    const info = getToolInfo(toolName);
    if (!info) return true; // Unknown tools always register
    if (tierMode === 'essential') return info.tier === 'essential';
    if (tierMode === 'standard') return info.tier !== 'internal';
    return true; // 'all' mode
  }

  // --- Definition-based tool registration ---
  // Tools extracted into tool-defs/ are registered via this loop.
  // The loop handles try-catch, JSON serialization, tier filtering, and next-step suggestions.
  const { ALL_TOOL_DEFS } = await import('./tool-defs/index.js');

  for (const def of ALL_TOOL_DEFS) {
    if (!shouldRegister(def.name)) continue;
    server.tool(def.name, def.description, def.params, async (args: any) => {
      try {
        const result = await def.handler(args);
        const text = withNextSteps(def.name, JSON.stringify(result, null, 2));
        return { content: [{ type: 'text' as const, text }] };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        };
      }
    });
  }

  server.tool(
    'discover_tools',
    'List all available CivUI MCP tools with their tier (essential/advanced/internal), category, and description. Use this to find specific tools for your task.',
    {
      tier: z.enum(['essential', 'advanced', 'internal']).optional().describe('Filter by tier'),
      category: z.string().optional().describe('Filter by category (gov-forms, form-generation, validation, etc.)'),
    },
    async ({ tier, category }) => {
      try {
        const { discoverTools } = await import('./tools/discover-tools.js');
        const result = discoverTools({ tier, category });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text' as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    },
  );

// --- Form Lifecycle Tools ---

// --- Prompts ---

  server.prompt(
    CONVERT_LEGACY_FORM_NAME,
    CONVERT_LEGACY_FORM_DESCRIPTION,
    {
      source: z
        .enum(['html', 'pdf'])
        .describe('Source format of the legacy form'),
    },
    async ({ source }) => convertLegacyFormPrompt(source),
  );

  server.prompt(
    BUILD_GOVERNMENT_FORM_NAME,
    BUILD_GOVERNMENT_FORM_DESCRIPTION,
    {
      formPurpose: z
        .string()
        .describe('Plain-English description of the form purpose'),
    },
    async ({ formPurpose }) => buildGovernmentFormPrompt(formPurpose),
  );

  server.prompt(
    AUDIT_508_COMPLIANCE_NAME,
    AUDIT_508_COMPLIANCE_DESCRIPTION,
    {
      markup: z
        .string()
        .describe('CivUI HTML markup to audit for compliance'),
    },
    async ({ markup }) => audit508CompliancePrompt(markup),
  );

  server.prompt(
    ADD_FIELD_NAME,
    ADD_FIELD_DESCRIPTION,
    {
      fieldType: z
        .enum(FIELD_TYPES)
        .describe('The type of field to generate'),
      label: z
        .string()
        .describe('The label text for the field'),
    },
    async ({ fieldType, label }) => addFieldPrompt(fieldType, label),
  );

  server.prompt(
    MIGRATE_FORM_NAME,
    MIGRATE_FORM_DESCRIPTION,
    {
      source: z
        .enum(['html', 'pdf'])
        .describe('Source format of the legacy form'),
    },
    async ({ source }) => migrateFormPrompt(source),
  );

  server.prompt(
    REVIEW_FORM_UX_NAME,
    REVIEW_FORM_UX_DESCRIPTION,
    {
      markup: z
        .string()
        .describe('CivUI HTML markup to review'),
    },
    async ({ markup }) => reviewFormUxPrompt(markup),
  );

  server.prompt(
    CONDITIONAL_FORM_NAME,
    CONDITIONAL_FORM_DESCRIPTION,
    {
      description: z
        .string()
        .describe('Plain-English description of the conditional form requirements'),
    },
    async ({ description }) => conditionalFormPrompt(description),
  );

  server.prompt(
    BUILD_COMPLEX_FORM_NAME,
    BUILD_COMPLEX_FORM_DESCRIPTION,
    {
      description: z
        .string()
        .describe('Plain-English description of the complex form requirements'),
    },
    async ({ description }) => buildComplexFormPrompt(description),
  );

  server.prompt(
    BUILD_WORKFLOW_FORM_NAME,
    BUILD_WORKFLOW_FORM_DESCRIPTION,
    {
      description: z
        .string()
        .describe('Plain-English description of the multi-actor workflow form requirements'),
    },
    async ({ description }) => buildWorkflowFormPrompt(description),
  );

  // ── VA Form Tools ───────────────────────────────────────────

return server;
}
