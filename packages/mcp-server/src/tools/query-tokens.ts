/**
 * query_tokens tool — look up CivUI design token values by category, name pattern, or type.
 *
 * All 9 token files are embedded as static data. The W3C DTCG structure is parsed
 * at module load into a flat TokenEntry[] for fast querying.
 *
 * No external imports — everything is hardcoded.
 */

export interface TokenEntry {
  /** Dot-delimited token name, e.g. "primary-lightest" or "outline-color". */
  name: string;
  /** Top-level category: color, color-dark, spacing, typography, border, focus, motion, shadow, scales. */
  category: string;
  /** W3C DTCG $type, e.g. "color", "dimension", "duration", "cubicBezier", "shadow", "fontFamily", "fontWeight", "number". Empty string for non-standard tokens. */
  type: string;
  /** Resolved value as a string. Objects/arrays are JSON-stringified. */
  value: string;
  /** CSS custom property name, e.g. "--civ-color-primary-dark". */
  cssVar: string;
  /** Example Tailwind utility using the civ- prefix. Empty string if no mapping exists. */
  tailwind: string;
}

export interface QueryTokensResult {
  /** Matching tokens. */
  tokens: TokenEntry[];
  /** Number of matching tokens. */
  count: number;
  /** Distinct categories present in the results. */
  categories: string[];
}

// ---------------------------------------------------------------------------
// Tailwind prefix mapping per category + subcategory
// ---------------------------------------------------------------------------

function tailwindPrefix(category: string, subcategory: string): string {
  switch (category) {
    case 'color':
      return 'civ-text-';
    case 'color-dark':
      return 'civ-text-';
    case 'spacing':
      return 'civ-p-';
    case 'typography':
      if (subcategory === 'fontSize') return 'civ-text-';
      if (subcategory === 'fontWeight') return 'civ-font-';
      if (subcategory === 'fontFamily') return 'civ-font-';
      if (subcategory === 'lineHeight') return 'civ-leading-';
      return '';
    case 'border':
      if (subcategory === 'radius') return 'civ-rounded-';
      if (subcategory === 'width') return 'civ-border-';
      return '';
    case 'focus':
      return 'civ-focus-';
    case 'motion':
      if (subcategory === 'duration') return 'civ-duration-';
      if (subcategory === 'easing') return 'civ-ease-';
      return '';
    case 'shadow':
      return 'civ-shadow-';
    case 'scales':
      return '';
    default:
      return '';
  }
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  return JSON.stringify(val);
}

// ---------------------------------------------------------------------------
// Static token data — mirrors the 9 token JSON files
// ---------------------------------------------------------------------------

const TOKENS: TokenEntry[] = [];

/**
 * Push a single token entry into the TOKENS array.
 */
function addToken(
  name: string,
  category: string,
  subcategory: string,
  type: string,
  value: unknown,
): void {
  const cssVar = `--civ-${category}-${name}`;
  const prefix = tailwindPrefix(category, subcategory);
  const tw = prefix ? `${prefix}${name}` : '';
  TOKENS.push({
    name,
    category,
    type,
    value: formatValue(value),
    cssVar,
    tailwind: tw,
  });
}

/**
 * Parse a W3C DTCG token group (with possible inherited $type) and push entries.
 * Handles nested groups like color.accent.cool or focus.outline.
 */
function parseGroup(
  obj: Record<string, unknown>,
  category: string,
  subcategory: string,
  parentType: string,
  namePrefix: string,
): void {
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue; // skip $type, $description, $value

    const child = obj[key] as Record<string, unknown>;
    if (child == null || typeof child !== 'object') continue;

    // If the child has a $value, it's a leaf token
    if ('$value' in child) {
      const type = (child['$type'] as string) || parentType;
      const tokenName = namePrefix ? `${namePrefix}-${key}` : key;
      addToken(tokenName, category, subcategory, type, child['$value']);
    } else if ('$type' in child) {
      // It's a group with an inherited $type (e.g., color.primary with $type: "color")
      const groupType = child['$type'] as string;
      const newPrefix = namePrefix ? `${namePrefix}-${key}` : key;
      parseGroup(child, category, subcategory, groupType, newPrefix);
    } else {
      // Nested group without $type (e.g., focus.outline, accent.cool)
      const newPrefix = namePrefix ? `${namePrefix}-${key}` : key;
      parseGroup(child, category, subcategory, parentType, newPrefix);
    }
  }
}

// ---- color.tokens.json ----
parseGroup(
  {
    primary: {
      $type: 'color',
      lightest: { $value: '#d9e8f6' },
      lighter: { $value: '#73b3e7' },
      light: { $value: '#2378c3' },
      DEFAULT: { $value: '#005ea2' },
      vivid: { $value: '#0050d8' },
      dark: { $value: '#1a4480' },
      darker: { $value: '#162e51' },
    },
    error: {
      $type: 'color',
      lighter: { $value: '#f4e3db' },
      light: { $value: '#d63e04' },
      DEFAULT: { $value: '#b50909' },
      dark: { $value: '#8b0a03' },
    },
    warning: {
      $type: 'color',
      lighter: { $value: '#faf3d1' },
      light: { $value: '#fee685' },
      DEFAULT: { $value: '#e5a000' },
      dark: { $value: '#936f38' },
    },
    success: {
      $type: 'color',
      lighter: { $value: '#ecf3ec' },
      light: { $value: '#70e17b' },
      DEFAULT: { $value: '#00a91c' },
      dark: { $value: '#4d8055' },
    },
    info: {
      $type: 'color',
      lighter: { $value: '#e7f6f8' },
      light: { $value: '#99deea' },
      DEFAULT: { $value: '#00bde3' },
      dark: { $value: '#2e6276' },
    },
    base: {
      $type: 'color',
      lightest: { $value: '#f0f0f0' },
      lighter: { $value: '#dfe1e2' },
      light: { $value: '#a9aeb1' },
      DEFAULT: { $value: '#71767a' },
      dark: { $value: '#565c65' },
      darker: { $value: '#3d4551' },
      darkest: { $value: '#1b1b1b' },
    },
    white: {
      $type: 'color',
      DEFAULT: { $value: '#ffffff' },
    },
    black: {
      $type: 'color',
      DEFAULT: { $value: '#000000' },
    },
    accent: {
      $type: 'color',
      cool: {
        lightest: { $value: '#e1f3f8' },
        light: { $value: '#97d4ea' },
        DEFAULT: { $value: '#00bde3' },
        dark: { $value: '#28a0cb' },
      },
      warm: {
        lightest: { $value: '#f2e4d4' },
        light: { $value: '#ffbc78' },
        DEFAULT: { $value: '#fa9441' },
        dark: { $value: '#c05600' },
      },
    },
  },
  'color',
  'color',
  '',
  '',
);

// ---- color-dark.tokens.json ----
parseGroup(
  {
    primary: {
      $type: 'color',
      lightest: { $value: '#1a3a5c' },
      lighter: { $value: '#2e6ca8' },
      light: { $value: '#5aa3e8' },
      DEFAULT: { $value: '#73b3e7' },
      vivid: { $value: '#5ea7f5' },
      dark: { $value: '#a4cef4' },
      darker: { $value: '#d0e4f8' },
    },
    error: {
      $type: 'color',
      lighter: { $value: '#4a2020' },
      light: { $value: '#e87461' },
      DEFAULT: { $value: '#f28b82' },
      dark: { $value: '#f5b7b1' },
    },
    warning: {
      $type: 'color',
      lighter: { $value: '#4a3d1a' },
      light: { $value: '#f5d576' },
      DEFAULT: { $value: '#f5c542' },
      dark: { $value: '#c9a24d' },
    },
    success: {
      $type: 'color',
      lighter: { $value: '#1e3a20' },
      light: { $value: '#81d88a' },
      DEFAULT: { $value: '#5cb85c' },
      dark: { $value: '#7ec97e' },
    },
    info: {
      $type: 'color',
      lighter: { $value: '#1a3a40' },
      light: { $value: '#7dd3e0' },
      DEFAULT: { $value: '#4dd0e1' },
      dark: { $value: '#80deea' },
    },
    base: {
      $type: 'color',
      lightest: { $value: '#2d2d2d' },
      lighter: { $value: '#3d3d3d' },
      light: { $value: '#8a8a8a' },
      DEFAULT: { $value: '#a0a0a0' },
      dark: { $value: '#c4c4c4' },
      darker: { $value: '#e0e0e0' },
      darkest: { $value: '#f0f0f0' },
    },
    white: {
      $type: 'color',
      DEFAULT: { $value: '#1b1b1b' },
    },
    black: {
      $type: 'color',
      DEFAULT: { $value: '#ffffff' },
    },
    accent: {
      $type: 'color',
      cool: {
        lightest: { $value: '#1a3a40' },
        light: { $value: '#6bc5d8' },
        DEFAULT: { $value: '#4dd0e1' },
        dark: { $value: '#80deea' },
      },
      warm: {
        lightest: { $value: '#3d2d1a' },
        light: { $value: '#f5b87a' },
        DEFAULT: { $value: '#f5a654' },
        dark: { $value: '#e8924a' },
      },
    },
  },
  'color-dark',
  'color-dark',
  '',
  '',
);

// ---- spacing.tokens.json ----
parseGroup(
  {
    '0': { $type: 'dimension', $value: '0px' },
    px: { $type: 'dimension', $value: '1px' },
    '0.5': { $type: 'dimension', $value: '2px' },
    '1': { $type: 'dimension', $value: '4px' },
    '1.5': { $type: 'dimension', $value: '6px' },
    '2': { $type: 'dimension', $value: '8px' },
    '2.5': { $type: 'dimension', $value: '10px' },
    '3': { $type: 'dimension', $value: '12px' },
    '4': { $type: 'dimension', $value: '16px' },
    '5': { $type: 'dimension', $value: '20px' },
    '6': { $type: 'dimension', $value: '24px' },
    '8': { $type: 'dimension', $value: '32px' },
    '10': { $type: 'dimension', $value: '40px' },
    '12': { $type: 'dimension', $value: '48px' },
    '16': { $type: 'dimension', $value: '64px' },
    '20': { $type: 'dimension', $value: '80px' },
  },
  'spacing',
  'spacing',
  '',
  '',
);

// ---- typography.tokens.json ----
// fontFamily
parseGroup(
  {
    sans: {
      $type: 'fontFamily',
      $value: [
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
      ],
    },
    mono: {
      $type: 'fontFamily',
      $value: [
        'Roboto Mono',
        'Consolas',
        'Monaco',
        'Andale Mono',
        'Ubuntu Mono',
        'monospace',
      ],
    },
  },
  'typography',
  'fontFamily',
  '',
  '',
);

// fontSize
parseGroup(
  {
    xs: { $type: 'dimension', $value: '12px' },
    sm: { $type: 'dimension', $value: '14px' },
    base: { $type: 'dimension', $value: '16px' },
    lg: { $type: 'dimension', $value: '18px' },
    xl: { $type: 'dimension', $value: '20px' },
    '2xl': { $type: 'dimension', $value: '24px' },
    '3xl': { $type: 'dimension', $value: '28px' },
    '4xl': { $type: 'dimension', $value: '36px' },
    '5xl': { $type: 'dimension', $value: '48px' },
  },
  'typography',
  'fontSize',
  '',
  '',
);

// fontWeight
parseGroup(
  {
    light: { $type: 'fontWeight', $value: 300 },
    regular: { $type: 'fontWeight', $value: 400 },
    semibold: { $type: 'fontWeight', $value: 600 },
    bold: { $type: 'fontWeight', $value: 700 },
  },
  'typography',
  'fontWeight',
  '',
  '',
);

// lineHeight
parseGroup(
  {
    none: { $type: 'number', $value: 1 },
    tight: { $type: 'number', $value: 1.25 },
    snug: { $type: 'number', $value: 1.375 },
    normal: { $type: 'number', $value: 1.5 },
    relaxed: { $type: 'number', $value: 1.625 },
    loose: { $type: 'number', $value: 2 },
  },
  'typography',
  'lineHeight',
  '',
  '',
);

// ---- border.tokens.json ----
// radius
parseGroup(
  {
    none: { $type: 'dimension', $value: '0px' },
    sm: { $type: 'dimension', $value: '2px' },
    DEFAULT: { $type: 'dimension', $value: '4px' },
    md: { $type: 'dimension', $value: '6px' },
    lg: { $type: 'dimension', $value: '8px' },
    full: { $type: 'dimension', $value: '9999px' },
  },
  'border',
  'radius',
  '',
  '',
);

// width
parseGroup(
  {
    '0': { $type: 'dimension', $value: '0px' },
    DEFAULT: { $type: 'dimension', $value: '1px' },
    '2': { $type: 'dimension', $value: '2px' },
    '4': { $type: 'dimension', $value: '4px' },
  },
  'border',
  'width',
  '',
  '',
);

// ---- focus.tokens.json ----
parseGroup(
  {
    outline: {
      color: { $type: 'color', $value: '#005ea2' },
      width: { $type: 'dimension', $value: '3px' },
      offset: { $type: 'dimension', $value: '2px' },
    },
    shadow: {
      color: { $type: 'color', $value: '#ffffff' },
      spread: { $type: 'dimension', $value: '3px' },
    },
  },
  'focus',
  'focus',
  '',
  '',
);

// ---- motion.tokens.json ----
// duration
parseGroup(
  {
    instant: { $type: 'duration', $value: '0ms' },
    fast: { $type: 'duration', $value: '100ms' },
    normal: { $type: 'duration', $value: '200ms' },
    slow: { $type: 'duration', $value: '300ms' },
    slower: { $type: 'duration', $value: '500ms' },
  },
  'motion',
  'duration',
  '',
  '',
);

// easing
parseGroup(
  {
    linear: { $type: 'cubicBezier', $value: [0, 0, 1, 1] },
    'ease-in': { $type: 'cubicBezier', $value: [0.4, 0, 1, 1] },
    'ease-out': { $type: 'cubicBezier', $value: [0, 0, 0.2, 1] },
    'ease-in-out': { $type: 'cubicBezier', $value: [0.4, 0, 0.2, 1] },
  },
  'motion',
  'easing',
  '',
  '',
);

// ---- shadow.tokens.json ----
parseGroup(
  {
    none: {
      $type: 'shadow',
      $value: { offsetX: '0px', offsetY: '0px', blur: '0px', spread: '0px', color: 'transparent' },
    },
    sm: {
      $type: 'shadow',
      $value: { offsetX: '0px', offsetY: '1px', blur: '2px', spread: '0px', color: 'rgba(0,0,0,0.05)' },
    },
    DEFAULT: {
      $type: 'shadow',
      $value: { offsetX: '0px', offsetY: '1px', blur: '3px', spread: '0px', color: 'rgba(0,0,0,0.1)' },
    },
    md: {
      $type: 'shadow',
      $value: { offsetX: '0px', offsetY: '4px', blur: '6px', spread: '-1px', color: 'rgba(0,0,0,0.1)' },
    },
    lg: {
      $type: 'shadow',
      $value: { offsetX: '0px', offsetY: '10px', blur: '15px', spread: '-3px', color: 'rgba(0,0,0,0.1)' },
    },
  },
  'shadow',
  'shadow',
  '',
  '',
);

// ---- scales.tokens.json ----
// Non-standard tokens (no $type). Manually add each entry.
const scalesData: Array<{ name: string; value: unknown }> = [
  { name: 'spacious-ratio', value: { min: 1.2, max: 1.333 } },
  { name: 'spacious-basePx', value: { min: 16, max: 18 } },
  { name: 'spacious-viewportPx', value: { min: 320, max: 1200 } },
  { name: 'spacious-spacingFactor', value: 1.25 },
  { name: 'spacious-lineHeight', value: { body: 1.6, heading: 1.3 } },
  { name: 'default-ratio', value: 1.2 },
  { name: 'default-basePx', value: 16 },
  { name: 'default-spacingFactor', value: 1 },
  { name: 'default-lineHeight', value: { body: 1.5, heading: 1.2 } },
  { name: 'dense-ratio', value: 1.125 },
  { name: 'dense-basePx', value: 14 },
  { name: 'dense-spacingFactor', value: 0.75 },
  { name: 'dense-lineHeight', value: { body: 1.4, heading: 1.15 } },
  {
    name: 'fontSizeSteps',
    value: [
      { step: -2, name: 'xs' },
      { step: -1, name: 'sm' },
      { step: 0, name: 'base' },
      { step: 1, name: 'lg' },
      { step: 2, name: 'xl' },
      { step: 3, name: '2xl' },
      { step: 4, name: '3xl' },
      { step: 5, name: '4xl' },
      { step: 6, name: '5xl' },
    ],
  },
  {
    name: 'spacingTokens',
    value: ['0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '8', '10', '12', '16', '20'],
  },
];

for (const entry of scalesData) {
  TOKENS.push({
    name: entry.name,
    category: 'scales',
    type: '',
    value: formatValue(entry.value),
    cssVar: `--civ-scales-${entry.name}`,
    tailwind: '',
  });
}

// ---------------------------------------------------------------------------
// Query function
// ---------------------------------------------------------------------------

export interface QueryTokensOptions {
  /** Exact match on category (e.g. "color", "spacing", "typography"). */
  category?: string;
  /** Case-insensitive substring search on token name. */
  search?: string;
  /** Exact match on W3C DTCG $type (e.g. "color", "dimension", "duration"). */
  type?: string;
}

/**
 * Query CivUI design tokens by category, name pattern, or type.
 *
 * All filters are AND-ed: a token must match every provided filter.
 * With no filters, all tokens are returned.
 */
export function queryTokens(options: QueryTokensOptions = {}): QueryTokensResult {
  const { category, search, type } = options;
  const searchLower = search?.toLowerCase();

  const filtered = TOKENS.filter((token) => {
    if (category && token.category !== category) return false;
    if (searchLower && !token.name.toLowerCase().includes(searchLower)) return false;
    if (type && token.type !== type) return false;
    return true;
  });

  const categories = [...new Set(filtered.map((t) => t.category))].sort();

  return {
    tokens: filtered,
    count: filtered.length,
    categories,
  };
}
