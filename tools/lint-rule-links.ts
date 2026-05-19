/**
 * Maps lint script names to the rule documentation that explains the
 * pattern and how to fix it. Used by `printRuleLink()` to append a
 * `→ see <path>` line at the bottom of each lint's failure output so
 * agents (and humans) can jump straight to the fix-it explanation.
 *
 * Anchor format follows Docusaurus / GitHub auto-anchors:
 *   - Lowercase
 *   - Spaces and punctuation become `-`
 *   - Em dashes (—) become `--`
 *
 * Add an entry when you create a new lint OR when you write a new
 * rule-doc section that an existing lint should link to.
 */
export interface RuleLink {
  /** Path to the rule doc, relative to repo root. */
  path: string;
  /** Markdown anchor inside the file, without the `#`. */
  anchor: string;
}

export const LINT_RULE_LINKS: Record<string, RuleLink> = {
  fieldsets: {
    path: '.claude/rules/common-traps.md',
    anchor: 'group-components-are-self-contained--no-extra-fieldset',
  },
  'story-embeds': {
    path: '.claude/rules/common-traps.md',
    anchor: 'storybook-export-name--url-slug',
  },
  'story-names': {
    path: '.claude/rules/common-traps.md',
    anchor: 'story-display-name-should-describe-the-story',
  },
  'story-props': {
    path: '.claude/rules/common-traps.md',
    anchor: 'stories--component-implementation',
  },
  'prose-refs': {
    path: '.claude/rules/common-traps.md',
    anchor: 'self-contained-controls--no-civ-form-field-wrapper',
  },
  'color-classes': {
    path: '.claude/rules/common-traps.md',
    anchor: 'color-utility-class-typos-silently-render-unstyled-text',
  },
  'jsdoc-props': {
    path: '.claude/rules/common-traps.md',
    anchor: 'jsdoc-prop-tags-drift-from-real-property-declarations',
  },
  'jsdoc-events': {
    path: '.claude/rules/common-traps.md',
    anchor: 'jsdoc-prop-tags-drift-from-real-property-declarations',
  },
  'muted-body-text': {
    path: '.claude/rules/common-traps.md',
    anchor: 'mutedgray-text-classes-on-p-body-text',
  },
  // The three lints below are vitest-driven (not standalone tsx scripts),
  // so their rule links are emitted by a shell `||` wrapper in package.json
  // — not by calling `printRuleLink()` from inside the lint. Keep the map
  // entries in sync with the package.json links so the canonical mapping
  // lives in one place. If you change the anchor here, also update the
  // matching `lint:<name>` script in package.json.
  'double-labels': {
    path: '.claude/rules/common-traps.md',
    anchor: 'double-labelled-form-controls',
  },
  'missing-labels': {
    path: '.claude/rules/common-traps.md',
    anchor: 'unlabelled-form-controls-inside-compound-components',
  },
  'stacked-required': {
    path: '.claude/rules/common-traps.md',
    anchor: 'section-legends-dont-carry-required-leaf-inputs-do',
  },
  'ios-stub-allowlist': {
    path: '.claude/rules/audit-debt.md',
    anchor: 'native-platform-implementation-pass-ios--android',
  },
};

/**
 * Prints a `→ see <path>#<anchor>` line for the given lint, if a
 * rule link is registered. Call this at the end of a lint's failure
 * output (right before returning the non-zero exit code) so the
 * reader can jump straight to the fix-it documentation.
 *
 * Safe to call for unknown lints — emits nothing.
 */
export function printRuleLink(lintName: string): void {
  const link = LINT_RULE_LINKS[lintName];
  if (!link) return;
  console.log(`→ see ${link.path}#${link.anchor}`);
}
