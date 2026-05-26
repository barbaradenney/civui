/**
 * get_component_guide
 *
 * Returns a focused per-component reference synthesized from the
 * data we already have:
 *
 *   - The schema (description, category, props, events, a11y)
 *   - The canonical examples extracted from `*.stories.ts`
 *   - Any matching trap entries from `.claude/rules/common-traps.md`
 *
 * Why this exists vs. the broad AI_GUIDE resource: the AI guide is
 * ~2,000 lines that gets pulled into context wholesale. When an
 * agent only needs to use `civ-text-input`, that's wasted tokens.
 * `get_component_guide({ name: 'civ-text-input' })` returns just
 * the slice the agent needs.
 *
 * Synthesized at runtime rather than pre-baked because the inputs
 * already exist as standalone resources (schema package, examples
 * JSON, hand-written traps file). Synthesizing means we can never
 * drift — there's no copy of the data to maintain.
 */

import contractsRaw from '@civui/schema/contracts.json' with { type: 'json' };
import examplesRaw from '../resources/component-examples.json' with { type: 'json' };
import commonTrapsRaw from '../resources/common-traps.json' with { type: 'json' };

const COMMON_TRAPS = (commonTrapsRaw as { markdown: string }).markdown;

interface PropDef {
  type?: string;
  description?: string;
  default?: unknown;
  values?: (string | number)[];
  webOnly?: boolean;
}

interface ComponentSchema {
  name: string;
  description: string;
  category: string;
  props?: Record<string, PropDef>;
  events?: Record<string, { description?: string }>;
  a11y?: Record<string, unknown>;
}

interface RawExample {
  story: string;
  name?: string;
  category: string;
  html: string;
  source: string;
}

const contracts = contractsRaw as Record<string, ComponentSchema>;
const examples = examplesRaw as Record<string, RawExample[]>;

export interface GetComponentGuideParams {
  /** Component tag — e.g. `civ-text-input`. */
  name: string;
  /** How many examples to include (default 3 for focused output). */
  exampleLimit?: number;
}

interface PropSummary {
  name: string;
  type: string;
  default?: unknown;
  description?: string;
  values?: (string | number)[];
  webOnly?: boolean;
}

interface RelatedComponent {
  name: string;
  description: string;
}

interface GetComponentGuideResult {
  name: string;
  found: boolean;
  /** Suggested similar names when `name` doesn't resolve. */
  suggestions?: string[];
  schema?: {
    description: string;
    category: string;
    props: PropSummary[];
    events: Array<{ name: string; description?: string }>;
    a11y?: Record<string, unknown>;
  };
  examples?: Array<{ story: string; name?: string; html: string; source: string }>;
  /** Excerpts from common-traps.md whose body mentions this component. */
  traps?: string[];
  /** Same-category neighbors for "you might also want" guidance. */
  related?: RelatedComponent[];
}

/** Pull h2 sections from common-traps.md that mention the component name. */
function findTraps(componentName: string): string[] {
  const sections = COMMON_TRAPS.split(/\n##\s+/).slice(1); // first split is the file preamble
  const hits: string[] = [];
  for (const section of sections) {
    if (section.includes(componentName)) {
      // Reattach the `## ` heading marker that split() consumed.
      hits.push(`## ${section}`.trim());
    }
  }
  return hits;
}

/**
 * Find related components — same category, excluding self. Capped at
 * 5 to keep the response from ballooning when the category bucket
 * is large.
 */
function findRelated(schema: ComponentSchema): RelatedComponent[] {
  return Object.values(contracts)
    .filter(c => c.category === schema.category && c.name !== schema.name)
    .slice(0, 5)
    .map(c => ({ name: c.name, description: c.description }));
}

export function getComponentGuide(params: GetComponentGuideParams): GetComponentGuideResult {
  const exampleLimit = params.exampleLimit ?? 3;
  const schema = contracts[params.name];

  if (!schema) {
    // Suggest based on shared tokens, not whole-string substring — so a
    // typo like "civ-input" can find "civ-text-input" via the shared
    // "input" token. Strip the "civ-" prefix and split on "-" to compare
    // word stems.
    const queryTokens = params.name.replace(/^civ-/, '').split('-').filter(Boolean);
    const suggestions = Object.keys(contracts)
      .filter(tag => {
        const tagTokens = tag.replace(/^civ-/, '').split('-');
        return queryTokens.some(q => tagTokens.includes(q));
      })
      .slice(0, 5);
    return {
      name: params.name,
      found: false,
      ...(suggestions.length > 0 ? { suggestions } : {}),
    };
  }

  const props: PropSummary[] = Object.entries(schema.props ?? {}).map(([name, p]) => ({
    name,
    type: p.type ?? 'unknown',
    ...(p.default !== undefined ? { default: p.default } : {}),
    ...(p.description ? { description: p.description } : {}),
    ...(p.values ? { values: p.values } : {}),
    ...(p.webOnly ? { webOnly: true } : {}),
  }));

  const events = Object.entries(schema.events ?? {}).map(([name, e]) => ({
    name,
    ...(e.description ? { description: e.description } : {}),
  }));

  const componentExamples = (examples[params.name] ?? []).slice(0, exampleLimit).map(e => ({
    story: e.story,
    ...(e.name ? { name: e.name } : {}),
    html: e.html,
    source: e.source,
  }));

  const traps = findTraps(params.name);
  const related = findRelated(schema);

  return {
    name: params.name,
    found: true,
    schema: {
      description: schema.description,
      category: schema.category,
      props,
      events,
      ...(schema.a11y ? { a11y: schema.a11y } : {}),
    },
    examples: componentExamples,
    ...(traps.length > 0 ? { traps } : {}),
    ...(related.length > 0 ? { related } : {}),
  };
}
