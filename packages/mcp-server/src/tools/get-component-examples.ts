/**
 * get_component_examples
 *
 * Returns canonical usage snippets for a CivUI component. Snippets
 * are extracted at build time from the component's `*.stories.ts`
 * files (see `scripts/build-component-examples.ts`) and bundled
 * into `component-examples.json`, so consumers get the same set
 * the published Storybook shows.
 *
 * Why this exists: agents asking "how do I use civ-X" used to have
 * to load the Storybook iframe or wade through the full ai-guide.
 * Now they call this tool with `name: 'civ-X'` and get a focused
 * list of working snippets.
 */

import examplesRaw from '../resources/component-examples.json' with { type: 'json' };

interface RawExample {
  story: string;
  name?: string;
  category: string;
  html: string;
  source: string;
}

const examples = examplesRaw as Record<string, RawExample[]>;

export interface GetComponentExamplesParams {
  /** Component tag — e.g. `civ-text-input`. Required. */
  name: string;
  /**
   * Cap the number of examples returned. The full set for some
   * components (civ-button has 19 stories) is overkill for most
   * agent queries — the default of 6 is the "show me the variety"
   * scope.
   */
  limit?: number;
}

interface ExampleResult {
  story: string;
  name?: string;
  category: string;
  html: string;
  source: string;
}

interface GetComponentExamplesResult {
  name: string;
  totalAvailable: number;
  /** When the component has more stories than `limit`, this hints which were trimmed. */
  truncated: boolean;
  examples: ExampleResult[];
  /** Suggested next tools when no match is found. */
  suggestions?: string[];
}

export function getComponentExamples(params: GetComponentExamplesParams): GetComponentExamplesResult {
  const limit = params.limit ?? 6;
  const found = examples[params.name] ?? [];

  if (found.length === 0) {
    // Suggest similar component names via shared tokens (split on `-`)
    // so a typo like `civ-input` can surface `civ-text-input` via the
    // shared "input" stem.
    const queryTokens = params.name.replace(/^civ-/, '').split('-').filter(Boolean);
    const suggestions = Object.keys(examples)
      .filter(tag => {
        const tagTokens = tag.replace(/^civ-/, '').split('-');
        return queryTokens.some(q => tagTokens.includes(q));
      })
      .slice(0, 5);
    return {
      name: params.name,
      totalAvailable: 0,
      truncated: false,
      examples: [],
      ...(suggestions.length > 0 ? { suggestions } : {}),
    };
  }

  return {
    name: params.name,
    totalAvailable: found.length,
    truncated: found.length > limit,
    examples: found.slice(0, limit),
  };
}

/** List every component that has at least one example. Used by `discover_examples`. */
export function listComponentsWithExamples(): {
  totalComponents: number;
  totalExamples: number;
  components: Array<{ name: string; count: number }>;
} {
  const components = Object.entries(examples)
    .map(([name, list]) => ({ name, count: list.length }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const totalExamples = components.reduce((acc, c) => acc + c.count, 0);
  return {
    totalComponents: components.length,
    totalExamples,
    components,
  };
}
