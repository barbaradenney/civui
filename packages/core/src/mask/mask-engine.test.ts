import { describe, it, expect } from 'vitest';
import {
  MASK_PRESETS,
  applyMask,
  stripMask,
  isComplete,
  getMaxRawLength,
  computeCursorPosition,
  filterInput,
  processRawInput,
} from './mask-engine.js';

describe('mask-engine', () => {
  describe('MASK_PRESETS', () => {
    it('defines all expected presets', () => {
      expect(Object.keys(MASK_PRESETS)).toEqual([
        'ssn',
        'phone-us',
        'zip',
        'zip4',
        'ein',
        'currency',
        'phone-intl',
      ]);
    });

    it('marks ssn and ein as pii', () => {
      expect(MASK_PRESETS.ssn.pii).toBe(true);
      expect(MASK_PRESETS.ein.pii).toBe(true);
    });

    it('marks non-pii presets correctly', () => {
      expect(MASK_PRESETS['phone-us'].pii).toBe(false);
      expect(MASK_PRESETS.zip.pii).toBe(false);
      expect(MASK_PRESETS.zip4.pii).toBe(false);
      expect(MASK_PRESETS['phone-intl'].pii).toBe(false);
    });
  });

  describe('getMaxRawLength', () => {
    it('returns 9 for SSN pattern', () => {
      expect(getMaxRawLength('###-##-####')).toBe(9);
    });

    it('returns 10 for US phone pattern', () => {
      expect(getMaxRawLength('(###) ###-####')).toBe(10);
    });

    it('returns 5 for ZIP pattern', () => {
      expect(getMaxRawLength('#####')).toBe(5);
    });

    it('returns 9 for ZIP+4 pattern', () => {
      expect(getMaxRawLength('#####-####')).toBe(9);
    });

    it('returns 9 for EIN pattern', () => {
      expect(getMaxRawLength('##-#######')).toBe(9);
    });

    it('returns 11 for intl phone pattern', () => {
      expect(getMaxRawLength('+# (###) ###-####')).toBe(11);
    });

    it('counts mixed slot types', () => {
      expect(getMaxRawLength('AA-###-**')).toBe(7);
    });
  });

  describe('applyMask', () => {
    it('formats a full SSN', () => {
      expect(applyMask('123456789', '###-##-####')).toBe('123-45-6789');
    });

    it('formats a full US phone', () => {
      expect(applyMask('5551234567', '(###) ###-####')).toBe('(555) 123-4567');
    });

    it('formats a full ZIP', () => {
      expect(applyMask('12345', '#####')).toBe('12345');
    });

    it('formats a full ZIP+4', () => {
      expect(applyMask('123456789', '#####-####')).toBe('12345-6789');
    });

    it('formats a full EIN', () => {
      expect(applyMask('123456789', '##-#######')).toBe('12-3456789');
    });

    it('formats a full intl phone', () => {
      expect(applyMask('15551234567', '+# (###) ###-####')).toBe('+1 (555) 123-4567');
    });

    it('handles partial input for SSN', () => {
      expect(applyMask('123', '###-##-####')).toBe('123');
    });

    it('inserts literal after completed group', () => {
      expect(applyMask('1234', '###-##-####')).toBe('123-4');
    });

    it('handles partial phone input', () => {
      expect(applyMask('555', '(###) ###-####')).toBe('(555');
    });

    it('handles partial phone with more digits', () => {
      expect(applyMask('5551', '(###) ###-####')).toBe('(555) 1');
    });

    it('truncates input beyond pattern capacity', () => {
      expect(applyMask('1234567890', '###-##-####')).toBe('123-45-6789');
    });

    it('handles empty input', () => {
      expect(applyMask('', '###-##-####')).toBe('');
    });
  });

  describe('stripMask', () => {
    it('strips SSN formatting', () => {
      expect(stripMask('123-45-6789', '###-##-####')).toBe('123456789');
    });

    it('strips phone formatting', () => {
      expect(stripMask('(555) 123-4567', '(###) ###-####')).toBe('5551234567');
    });

    it('strips ZIP+4 formatting', () => {
      expect(stripMask('12345-6789', '#####-####')).toBe('123456789');
    });

    it('strips EIN formatting', () => {
      expect(stripMask('12-3456789', '##-#######')).toBe('123456789');
    });

    it('strips intl phone formatting', () => {
      expect(stripMask('+1 (555) 123-4567', '+# (###) ###-####')).toBe('15551234567');
    });

    it('round-trips with applyMask', () => {
      const patterns = [
        '###-##-####',
        '(###) ###-####',
        '#####',
        '#####-####',
        '##-#######',
        '+# (###) ###-####',
      ];
      const raws = [
        '123456789',
        '5551234567',
        '12345',
        '123456789',
        '987654321',
        '15551234567',
      ];

      for (let i = 0; i < patterns.length; i++) {
        const formatted = applyMask(raws[i], patterns[i]);
        const stripped = stripMask(formatted, patterns[i]);
        expect(stripped).toBe(raws[i]);
      }
    });
  });

  describe('isComplete', () => {
    it('returns true for full SSN input', () => {
      expect(isComplete('123456789', '###-##-####')).toBe(true);
    });

    it('returns false for partial SSN input', () => {
      expect(isComplete('12345', '###-##-####')).toBe(false);
    });

    it('returns true for full ZIP', () => {
      expect(isComplete('12345', '#####')).toBe(true);
    });

    it('returns false for empty input', () => {
      expect(isComplete('', '#####')).toBe(false);
    });

    it('returns true for full intl phone', () => {
      expect(isComplete('15551234567', '+# (###) ###-####')).toBe(true);
    });
  });

  describe('computeCursorPosition', () => {
    it('maps rawIndex 0 to position 0 for SSN', () => {
      expect(computeCursorPosition(0, '###-##-####')).toBe(0);
    });

    it('maps rawIndex 3 to position 4 for SSN (skips dash)', () => {
      expect(computeCursorPosition(3, '###-##-####')).toBe(4);
    });

    it('maps rawIndex 5 to position 7 for SSN (skips both dashes)', () => {
      expect(computeCursorPosition(5, '###-##-####')).toBe(7);
    });

    it('maps rawIndex 9 to end of SSN pattern', () => {
      expect(computeCursorPosition(9, '###-##-####')).toBe(11);
    });

    it('maps rawIndex 0 to position 1 for phone (after open paren)', () => {
      expect(computeCursorPosition(0, '(###) ###-####')).toBe(1);
    });

    it('maps rawIndex 3 to position 6 for phone (after ") ")', () => {
      expect(computeCursorPosition(3, '(###) ###-####')).toBe(6);
    });

    it('maps rawIndex 0 to position 1 for intl phone (after "+")', () => {
      expect(computeCursorPosition(0, '+# (###) ###-####')).toBe(1);
    });

    it('maps rawIndex 1 to position 4 for intl phone (after " (")', () => {
      expect(computeCursorPosition(1, '+# (###) ###-####')).toBe(4);
    });
  });

  describe('filterInput', () => {
    it('accepts digits for # slot', () => {
      expect(filterInput('5', '#')).toBe(true);
      expect(filterInput('0', '#')).toBe(true);
      expect(filterInput('9', '#')).toBe(true);
    });

    it('rejects letters for # slot', () => {
      expect(filterInput('a', '#')).toBe(false);
      expect(filterInput('Z', '#')).toBe(false);
    });

    it('rejects special chars for # slot', () => {
      expect(filterInput('-', '#')).toBe(false);
      expect(filterInput(' ', '#')).toBe(false);
    });

    it('accepts letters for A slot', () => {
      expect(filterInput('a', 'A')).toBe(true);
      expect(filterInput('Z', 'A')).toBe(true);
    });

    it('rejects digits for A slot', () => {
      expect(filterInput('5', 'A')).toBe(false);
    });

    it('rejects special chars for A slot', () => {
      expect(filterInput('-', 'A')).toBe(false);
    });

    it('accepts digits for * slot', () => {
      expect(filterInput('5', '*')).toBe(true);
    });

    it('accepts letters for * slot', () => {
      expect(filterInput('a', '*')).toBe(true);
    });

    it('accepts printable special chars for * slot', () => {
      expect(filterInput('-', '*')).toBe(true);
      expect(filterInput('@', '*')).toBe(true);
      expect(filterInput(' ', '*')).toBe(true);
    });
  });

  describe('processRawInput', () => {
    it('filters non-digit chars from numeric pattern', () => {
      expect(processRawInput('1a2b3c4d5e6f7g8h9', '###-##-####')).toBe('123456789');
    });

    it('truncates to max raw length', () => {
      expect(processRawInput('12345678901234', '###-##-####')).toBe('123456789');
    });

    it('handles empty input', () => {
      expect(processRawInput('', '###-##-####')).toBe('');
    });

    it('filters letters from digit-only pattern', () => {
      expect(processRawInput('abc', '#####')).toBe('');
    });

    it('filters digits from letter-only pattern', () => {
      expect(processRawInput('123', 'AAA')).toBe('');
    });

    it('accepts letters for A slots', () => {
      expect(processRawInput('ABC', 'AAA')).toBe('ABC');
    });

    it('handles mixed slot types', () => {
      // Pattern: AA-###-**
      // Input: 'aB1c23!x' should pick: a, B (A slots), 1, 2, 3 (# slots), !, x (* slots)
      expect(processRawInput('aB123!x', 'AA-###-**')).toBe('aB123!x');
    });

    it('skips invalid chars at each position for mixed pattern', () => {
      // Pattern: A#* — expects letter, digit, anything
      // Input: '1a2' — 1 is not a letter (skip), a is a letter (take), 2 is a digit (take), need * slot — but no more input
      expect(processRawInput('1a2', 'A#*')).toBe('a2');
    });
  });

  describe('custom patterns', () => {
    it('handles license plate pattern AA-####', () => {
      const pattern = 'AA-####';
      expect(getMaxRawLength(pattern)).toBe(6);
      expect(applyMask('AB1234', pattern)).toBe('AB-1234');
      expect(stripMask('AB-1234', pattern)).toBe('AB1234');
      expect(isComplete('AB1234', pattern)).toBe(true);
      expect(isComplete('AB123', pattern)).toBe(false);
    });

    it('handles pattern with * wildcard slots', () => {
      const pattern = '**-**-**';
      expect(getMaxRawLength(pattern)).toBe(6);
      expect(applyMask('a1b2c3', pattern)).toBe('a1-b2-c3');
      expect(stripMask('a1-b2-c3', pattern)).toBe('a1b2c3');
    });

    it('handles pattern with only slots (no literals)', () => {
      const pattern = '#####';
      expect(applyMask('12345', pattern)).toBe('12345');
      expect(stripMask('12345', pattern)).toBe('12345');
    });
  });
});
