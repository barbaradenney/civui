/**
 * lint_form_language tool — per-field linguistic analysis for government forms.
 * Checks for jargon, abbreviations, passive voice, readability, and consistency.
 */
import type { FormSchema, FormField } from '../schema/index.js';

export interface LanguageIssue {
  field: string;
  attribute: 'label' | 'hint' | 'required-message' | 'placeholder';
  text: string;
  issue: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
}

export interface LintLanguageResult {
  issues: LanguageIssue[];
  score: number;
  suggestions: Record<string, string>;
  summary: string;
}

/** Government jargon dictionary: word → plain language replacement. */
const JARGON: Record<string, string> = {
  pursuant: 'under',
  herein: 'in this form',
  aforementioned: 'previous',
  heretofore: 'until now',
  hereafter: 'from now on',
  therein: 'in that',
  thereof: 'of that',
  whereby: 'by which',
  wherein: 'in which',
  notwithstanding: 'despite',
  inasmuch: 'because',
  'in lieu of': 'instead of',
  effectuate: 'carry out',
  promulgate: 'issue',
  remuneration: 'payment',
  domicile: 'home',
  utilize: 'use',
  commence: 'start',
  terminate: 'end',
  facilitate: 'help',
  subsequently: 'then',
  prior: 'before',
  sufficient: 'enough',
  endeavor: 'try',
  ascertain: 'find out',
  furnish: 'provide',
  procure: 'get',
  forthwith: 'immediately',
};

/** Abbreviations that are acceptable (not flagged). */
const ABBREVIATION_EXCEPTIONS = new Set(['US', 'ID', 'OK', 'AM', 'PM', 'PO', 'DC', 'VA', 'MD', 'NY', 'CA', 'TX', 'FL']);

/** Action verbs expected in hints and placeholders. */
const ACTION_VERBS = ['enter', 'select', 'upload', 'choose', 'provide', 'type', 'pick', 'check', 'describe', 'list', 'write'];

/** Past participle endings for passive voice detection. */
const PAST_PARTICIPLE_PATTERN = /\b(?:is|are|was|were|be|been|being)\s+(?:\w+ed|given|taken|made|done|shown|seen|known|found|told|sent|left|held|kept|brought|thought|put|set|run|read|written|chosen|broken|spoken|driven|forgotten|gotten|hidden|proven|risen|shaken|stolen|sworn|thrown|woken|worn)\b/i;

/** Count syllables in a word (heuristic based on vowel groups). */
function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;
  let count = 0;
  let prevVowel = false;
  for (const char of clean) {
    const isVowel = 'aeiouy'.includes(char);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  // Silent e
  if (clean.endsWith('e') && count > 1) count--;
  return Math.max(1, count);
}

/** Compute Flesch-Kincaid grade level for a text. */
function fleschKincaidGrade(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (sentences.length === 0 || words.length === 0) return 0;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (totalSyllables / words.length) - 15.59;
}

/**
 * Lint a form schema for plain language issues.
 */
export function lintFormLanguage(schema: FormSchema): LintLanguageResult {
  const issues: LanguageIssue[] = [];
  const suggestions: Record<string, string> = {};

  /** Track terms used for consistency checking. */
  const termUsage: Record<string, string[]> = {};

  function checkText(field: FormField, attribute: LanguageIssue['attribute'], text: string): void {
    const lowerText = text.toLowerCase();

    // Jargon check
    for (const [jargon, replacement] of Object.entries(JARGON)) {
      const jargonPattern = new RegExp(`\\b${jargon}\\b`, 'i');
      if (jargonPattern.test(text)) {
        issues.push({
          field: field.name,
          attribute,
          text,
          issue: `Contains jargon: "${jargon}"`,
          suggestion: `Replace "${jargon}" with "${replacement}"`,
          severity: 'warning',
        });
        suggestions[`${field.name}.${attribute}`] = text.replace(jargonPattern, replacement);
      }
    }

    // Abbreviation check (2+ uppercase letters not in exceptions)
    const abbrevMatch = text.match(/\b([A-Z]{2,})\b/g);
    if (abbrevMatch) {
      for (const abbrev of abbrevMatch) {
        if (!ABBREVIATION_EXCEPTIONS.has(abbrev)) {
          issues.push({
            field: field.name,
            attribute,
            text,
            issue: `Contains abbreviation: "${abbrev}"`,
            suggestion: `Spell out "${abbrev}" in full`,
            severity: 'warning',
          });
        }
      }
    }

    // Long sentence check (for hints, >25 words)
    if (attribute === 'hint' || attribute === 'placeholder') {
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      for (const sentence of sentences) {
        const wordCount = sentence.trim().split(/\s+/).length;
        if (wordCount > 25) {
          issues.push({
            field: field.name,
            attribute,
            text: sentence.trim(),
            issue: `Sentence is ${wordCount} words (recommended: 25 or fewer)`,
            suggestion: 'Break into shorter sentences',
            severity: 'info',
          });
        }
      }
    }

    // Passive voice check
    if (PAST_PARTICIPLE_PATTERN.test(text)) {
      issues.push({
        field: field.name,
        attribute,
        text,
        issue: 'Uses passive voice',
        suggestion: 'Rewrite in active voice',
        severity: 'info',
      });
    }

    // Reading level check (only for longer text)
    const words = text.split(/\s+/);
    if (words.length >= 5) {
      const grade = fleschKincaidGrade(text);
      if (grade > 8) {
        issues.push({
          field: field.name,
          attribute,
          text,
          issue: `Reading level is grade ${Math.round(grade)} (recommended: grade 8 or lower)`,
          suggestion: 'Use simpler words and shorter sentences',
          severity: 'warning',
        });
      }
    }

    // Non-actionable hint/placeholder check
    if (attribute === 'hint' || attribute === 'placeholder') {
      const hasActionVerb = ACTION_VERBS.some((verb) => lowerText.startsWith(verb) || lowerText.includes(verb));
      if (!hasActionVerb && text.length > 0) {
        issues.push({
          field: field.name,
          attribute,
          text,
          issue: 'Hint lacks action verb',
          suggestion: `Start with an action verb (Enter, Select, Upload, Choose, Provide)`,
          severity: 'warning',
        });
      }
    }

    // Track terms for consistency
    if (attribute === 'label') {
      // Normalize concept words
      const conceptWords = lowerText.replace(/[^a-z\s]/g, '').split(/\s+/);
      for (const word of conceptWords) {
        if (word.length >= 4) {
          if (!termUsage[word]) termUsage[word] = [];
          termUsage[word].push(field.name);
        }
      }
    }
  }

  function processField(field: FormField): void {
    if (field.label) checkText(field, 'label', field.label);
    if (field.hint) checkText(field, 'hint', field.hint);
    if (field.placeholder) checkText(field, 'placeholder', field.placeholder);

    if (field.children) {
      for (const child of field.children) {
        processField(child);
      }
    }
  }

  for (const section of schema.sections) {
    for (const field of section.fields) {
      processField(field);
    }
  }

  // Consistency check: look for near-synonyms used in different labels
  const synonymPairs: [string, string][] = [
    ['name', 'nombre'],
    ['phone', 'telephone'],
    ['address', 'location'],
    ['email', 'e-mail'],
    ['start', 'begin'],
    ['end', 'finish'],
    ['employer', 'company'],
  ];
  for (const [a, b] of synonymPairs) {
    if (termUsage[a] && termUsage[b]) {
      issues.push({
        field: termUsage[a][0],
        attribute: 'label',
        text: `"${a}" and "${b}"`,
        issue: `Inconsistent terminology: "${a}" and "${b}" used for similar concepts`,
        suggestion: `Use consistent wording across the form`,
        severity: 'info',
      });
    }
  }

  // Score: 100 - (5 per error, 3 per warning, 1 per info), clamped 0-100
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'error') score -= 5;
    else if (issue.severity === 'warning') score -= 3;
    else score -= 1;
  }
  score = Math.max(0, Math.min(100, score));

  const summary = issues.length === 0
    ? 'No language issues found. Form uses plain, accessible language.'
    : `Found ${issues.length} language issues. Score: ${score}/100. ${issues.filter((i) => i.severity === 'warning').length} warnings, ${issues.filter((i) => i.severity === 'info').length} suggestions.`;

  return { issues, score, suggestions, summary };
}
