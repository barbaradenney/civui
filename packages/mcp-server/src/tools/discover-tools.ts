/**
 * discover_tools — meta-tool that lists all available CivUI MCP tools
 * with their tier, category, and description.
 *
 * This helps the LLM discover tools beyond the essential set.
 */

import { TOOL_REGISTRY } from '../tool-registry.js';

export interface DiscoverToolsResult {
  totalTools: number;
  tiers: {
    essential: number;
    advanced: number;
    internal: number;
  };
  categories: Record<string, Array<{ name: string; tier: string; description: string }>>;
}

export function discoverTools(options?: {
  tier?: string;
  category?: string;
}): DiscoverToolsResult {
  let tools = TOOL_REGISTRY;

  if (options?.tier) {
    tools = tools.filter(t => t.tier === options.tier);
  }
  if (options?.category) {
    tools = tools.filter(t => t.category === options.category);
  }

  const categories: Record<string, Array<{ name: string; tier: string; description: string }>> = {};
  for (const tool of tools) {
    if (!categories[tool.category]) categories[tool.category] = [];
    categories[tool.category].push({
      name: tool.name,
      tier: tool.tier,
      description: tool.description,
    });
  }

  return {
    totalTools: tools.length,
    tiers: {
      essential: tools.filter(t => t.tier === 'essential').length,
      advanced: tools.filter(t => t.tier === 'advanced').length,
      internal: tools.filter(t => t.tier === 'internal').length,
    },
    categories,
  };
}
