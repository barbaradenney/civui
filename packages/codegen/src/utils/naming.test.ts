import { describe, it, expect } from 'vitest';
import { toPascalCase, toCamelCase, toEnumCase, toComponentName, stripPrefix } from './naming.js';

describe('naming utilities', () => {
  describe('stripPrefix', () => {
    it('strips civ- prefix', () => {
      expect(stripPrefix('civ-text-input')).toBe('text-input');
    });

    it('returns unchanged if no prefix', () => {
      expect(stripPrefix('text-input')).toBe('text-input');
    });
  });

  describe('toPascalCase', () => {
    it('converts kebab to PascalCase', () => {
      expect(toPascalCase('civ-text-input')).toBe('CivTextInput');
    });

    it('handles single segment', () => {
      expect(toPascalCase('form')).toBe('Form');
    });

    it('handles multiple segments', () => {
      expect(toPascalCase('civ-memorable-date')).toBe('CivMemorableDate');
    });
  });

  describe('toCamelCase', () => {
    it('converts to camelCase without prefix', () => {
      expect(toCamelCase('civ-text-input')).toBe('textInput');
    });

    it('handles single segment', () => {
      expect(toCamelCase('civ-form')).toBe('form');
    });
  });

  describe('toEnumCase', () => {
    it('capitalizes first letter', () => {
      expect(toEnumCase('text')).toBe('Text');
    });

    it('prefixes underscore for numbers', () => {
      expect(toEnumCase('2xs')).toBe('_2xs');
    });
  });

  describe('toComponentName', () => {
    it('strips prefix and converts to PascalCase', () => {
      expect(toComponentName('civ-text-input')).toBe('TextInput');
    });

    it('handles segmented-control', () => {
      expect(toComponentName('civ-segmented-control')).toBe('SegmentedControl');
    });
  });
});
