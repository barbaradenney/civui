/**
 * CivUI Mask Engine — pure-logic utility for input masking.
 *
 * Supports three slot types:
 *   # = digit (0-9)
 *   A = letter (a-z, A-Z)
 *   * = any printable character
 *
 * All other characters in a pattern are treated as literals
 * and are inserted/stripped automatically.
 */

import type { CivLocaleStrings } from '../i18n/locale.js';

export type MaskChar = '#' | 'A' | '*';

export interface MaskDefinition {
  pattern: string;
  hintKey: keyof CivLocaleStrings | '';
  errorKey: keyof CivLocaleStrings | '';
  inputmode: string;
  pii: boolean;
}

const SLOT_CHARS = new Set<string>(['#', 'A', '*']);

function isSlot(ch: string): ch is MaskChar {
  return SLOT_CHARS.has(ch);
}

/** Preset mask definitions for common US government form fields. */
export const MASK_PRESETS: Record<string, MaskDefinition> = {
  ssn: {
    pattern: '###-##-####',
    hintKey: 'maskSsnHint',
    errorKey: 'maskSsnError',
    inputmode: 'numeric',
    pii: true,
  },
  'phone-us': {
    pattern: '(###) ###-####',
    hintKey: 'maskPhoneUsHint',
    errorKey: 'maskPhoneUsError',
    inputmode: 'tel',
    pii: false,
  },
  zip: {
    pattern: '#####',
    hintKey: 'maskZipHint',
    errorKey: 'maskZipError',
    inputmode: 'numeric',
    pii: false,
  },
  zip4: {
    pattern: '#####-####',
    hintKey: 'maskZip4Hint',
    errorKey: 'maskZip4Error',
    inputmode: 'numeric',
    pii: false,
  },
  ein: {
    pattern: '##-#######',
    hintKey: 'maskEinHint',
    errorKey: 'maskEinError',
    inputmode: 'numeric',
    pii: true,
  },
  currency: {
    pattern: '',
    hintKey: 'maskCurrencyHint',
    errorKey: 'maskCurrencyError',
    inputmode: 'decimal',
    pii: false,
  },
  // North American format (+1)
  'phone-intl': {
    pattern: '+# (###) ###-####',
    hintKey: 'maskPhoneIntlHint',
    errorKey: 'maskPhoneIntlError',
    inputmode: 'tel',
    pii: false,
  },
};

/**
 * Returns the number of slot characters (#, A, *) in a pattern.
 */
export function getMaxRawLength(pattern: string): number {
  let count = 0;
  for (const ch of pattern) {
    if (isSlot(ch)) count++;
  }
  return count;
}

/**
 * Returns true if `char` is valid for the given slot type.
 *   # → digit only
 *   A → letter only
 *   * → any printable (non-control) character
 */
export function filterInput(char: string, slotType: MaskChar): boolean {
  switch (slotType) {
    case '#':
      return /^\d$/.test(char);
    case 'A':
      return /^[a-zA-Z]$/.test(char);
    case '*':
      // Any single printable character (not a control char)
      return char.length === 1 && char >= ' ';
  }
}

/**
 * Takes raw input (digits/letters only) and inserts literal
 * characters from the pattern at their positions.
 *
 * Stops when raw chars are consumed or pattern is full.
 */
export function applyMask(raw: string, pattern: string): string {
  let result = '';
  let rawIdx = 0;

  for (let i = 0; i < pattern.length; i++) {
    if (rawIdx >= raw.length) break;

    const patternChar = pattern[i];
    if (isSlot(patternChar)) {
      result += raw[rawIdx];
      rawIdx++;
    } else {
      // Literal character — insert it and continue
      result += patternChar;
    }
  }

  return result;
}

/**
 * Removes literal characters from a formatted string,
 * returning only the user-typed characters.
 */
export function stripMask(formatted: string, pattern: string): string {
  let result = '';

  for (let i = 0; i < formatted.length && i < pattern.length; i++) {
    if (isSlot(pattern[i])) {
      result += formatted[i];
    }
  }

  return result;
}

/**
 * Returns true when the raw input length equals the number
 * of slot positions in the pattern.
 */
export function isComplete(raw: string, pattern: string): boolean {
  return raw.length === getMaxRawLength(pattern);
}

/**
 * Maps a raw character index to the corresponding position
 * in the formatted (masked) string, accounting for literals.
 *
 * Returns the formatted position where the raw character at
 * `rawIndex` would be placed. Skips over leading and
 * intermediate literal characters.
 */
export function computeCursorPosition(rawIndex: number, pattern: string): number {
  let rawCount = 0;

  for (let i = 0; i < pattern.length; i++) {
    if (isSlot(pattern[i])) {
      if (rawCount === rawIndex) return i;
      rawCount++;
    }
  }

  // rawIndex is at or past the end — return pattern length
  return pattern.length;
}

/**
 * Returns true if the character at `index` in the pattern is a slot
 * (#, A, *) rather than a literal character.
 */
export function isSlotPosition(index: number, pattern: string): boolean {
  if (index < 0 || index >= pattern.length) return false;
  return isSlot(pattern[index]);
}

/**
 * Takes arbitrary input, filters each character against its
 * corresponding slot type, and returns the valid raw string
 * (truncated to maxRawLength).
 */
export function processRawInput(input: string, pattern: string): string {
  const maxLen = getMaxRawLength(pattern);

  // Collect the slot types in order
  const slots: MaskChar[] = [];
  for (const ch of pattern) {
    if (isSlot(ch)) slots.push(ch as MaskChar);
  }

  let result = '';
  let slotIdx = 0;

  for (const char of input) {
    if (slotIdx >= maxLen) break;
    if (filterInput(char, slots[slotIdx])) {
      result += char;
      slotIdx++;
    }
  }

  return result;
}
