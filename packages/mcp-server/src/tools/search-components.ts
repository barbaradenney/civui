/**
 * search_components
 *
 * Natural-language search across CivUI component schemas. Takes an
 * agent's intent ("user uploads ID and signs", "checkbox group with
 * an unsure option") and returns ranked component recommendations
 * with their core contract attached, so the caller doesn't have to
 * re-fetch each schema.
 *
 * Scoring is intentionally simple: term-frequency weighted by where
 * each term hits. Name + category matches are weighted heavily;
 * description and prop-description matches contribute less. No
 * external NLP. Good-enough heuristic for an "I know what I want,
 * help me find it" query, not a semantic-search replacement.
 */

import contractsRaw from '@civui/schema/contracts.json' with { type: 'json' };

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
  extends?: string;
  isGroup?: boolean;
  props?: Record<string, PropDef>;
  events?: Record<string, { description?: string }>;
}

const contracts = contractsRaw as Record<string, ComponentSchema>;

/** Field weights — name/category hits matter more than prop-description matches. */
const WEIGHTS = {
  name: 5,
  category: 3,
  description: 2,
  propName: 2,
  propDescription: 1,
} as const;

/** Stop words trimmed from the query so common verbs / articles don't dominate the match. */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'be', 'by', 'do', 'for', 'from', 'how', 'i', 'in', 'is', 'it',
  'me', 'of', 'on', 'or', 'show', 'that', 'the', 'this', 'to', 'use', 'want', 'we', 'with',
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t));
}

function termHits(haystack: string, terms: string[]): number {
  if (!haystack) return 0;
  const text = haystack.toLowerCase();
  return terms.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
}

interface SearchResult {
  /** Component tag — e.g. `civ-text-input`. */
  name: string;
  /** Category bucket — e.g. `form-control`, `ui`, `layout`. */
  category: string;
  /** One-line schema description. */
  description: string;
  /** Match score (higher = better). */
  score: number;
  /**
   * Per-field score breakdown so the caller can see WHY a result
   * matched — useful when an agent is deciding between two close
   * matches.
   */
  matches: {
    name: number;
    category: number;
    description: number;
    propName: number;
    propDescription: number;
  };
  /** Public-prop names sorted alphabetically — the "what knobs do I have" summary. */
  props: string[];
  /** Event names this component fires. */
  events: string[];
}

export interface SearchComponentsParams {
  /** Free-form description of what the agent is trying to build. */
  query: string;
  /** Cap the number of results. Defaults to 5. */
  limit?: number;
  /** Restrict by category if known (e.g. only `form-control`). */
  category?: string;
}

export function searchComponents(params: SearchComponentsParams): {
  query: string;
  matchCount: number;
  results: SearchResult[];
} {
  const limit = params.limit ?? 5;
  const terms = tokenize(params.query);

  if (terms.length === 0) {
    return { query: params.query, matchCount: 0, results: [] };
  }

  const ranked: SearchResult[] = [];

  for (const schema of Object.values(contracts)) {
    if (params.category && schema.category !== params.category) continue;

    const nameHits = termHits(schema.name, terms);
    const categoryHits = termHits(schema.category, terms);
    const descHits = termHits(schema.description, terms);

    let propNameHits = 0;
    let propDescHits = 0;
    if (schema.props) {
      for (const [propName, prop] of Object.entries(schema.props)) {
        propNameHits += termHits(propName, terms);
        propDescHits += termHits(prop.description ?? '', terms);
      }
    }

    const score =
      nameHits * WEIGHTS.name +
      categoryHits * WEIGHTS.category +
      descHits * WEIGHTS.description +
      propNameHits * WEIGHTS.propName +
      propDescHits * WEIGHTS.propDescription;

    if (score === 0) continue;

    ranked.push({
      name: schema.name,
      category: schema.category,
      description: schema.description,
      score,
      matches: {
        name: nameHits,
        category: categoryHits,
        description: descHits,
        propName: propNameHits,
        propDescription: propDescHits,
      },
      props: Object.keys(schema.props ?? {}).sort(),
      events: Object.keys(schema.events ?? {}).sort(),
    });
  }

  // Sort by score desc, then by name asc for stable output.
  ranked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return {
    query: params.query,
    matchCount: ranked.length,
    results: ranked.slice(0, limit),
  };
}
