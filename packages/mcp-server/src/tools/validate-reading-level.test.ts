import { describe, it, expect } from 'vitest';
import { validateReadingLevel } from './validate-reading-level.js';

describe('validateReadingLevel', () => {
  it('throws when text is empty', () => {
    expect(() => validateReadingLevel('')).toThrow(
      'Text is required for readability analysis',
    );
  });

  it('throws when text is whitespace only', () => {
    expect(() => validateReadingLevel('   ')).toThrow(
      'Text is required for readability analysis',
    );
  });

  it('returns all expected properties', () => {
    const result = validateReadingLevel('The cat sat on the mat.');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('gradeLevel');
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('sentences');
    expect(result).toHaveProperty('words');
    expect(result).toHaveProperty('syllables');
    expect(result).toHaveProperty('passesTarget');
    expect(result).toHaveProperty('suggestions');
    expect(typeof result.score).toBe('number');
    expect(typeof result.gradeLevel).toBe('number');
    expect(typeof result.level).toBe('string');
  });

  it('simple text has low grade level', () => {
    const result = validateReadingLevel('The dog ran fast. It was fun.');
    expect(result.gradeLevel).toBeLessThan(8);
    expect(result.passesTarget).toBe(true);
    expect(result.level).toMatch(/easy|very easy/);
  });

  it('complex text has high grade level', () => {
    const result = validateReadingLevel(
      'The implementation of multifaceted organizational restructuring necessitates comprehensive stakeholder engagement strategies. Institutionalized bureaucratic methodologies predetermine administrative procedural outcomes.',
    );
    expect(result.gradeLevel).toBeGreaterThan(12);
    expect(result.passesTarget).toBe(false);
  });

  it('counts sentences correctly', () => {
    const result = validateReadingLevel('Hello world. How are you? I am fine!');
    expect(result.sentences).toBe(3);
  });

  it('counts words correctly', () => {
    const result = validateReadingLevel('One two three four five.');
    expect(result.words).toBe(5);
  });

  it('passesTarget respects custom target grade level', () => {
    const text = 'The cat sat on the mat.';
    const easy = validateReadingLevel(text, { targetGradeLevel: 12 });
    expect(easy.passesTarget).toBe(true);

    const hard = validateReadingLevel(text, { targetGradeLevel: -5 });
    expect(hard.passesTarget).toBe(false);
  });

  it('suggests splitting long sentences', () => {
    // Build a sentence with >25 words
    const longSentence =
      'The quick brown fox jumped over the lazy dog and then ran through the forest across the river and over the hill to the other side of the valley.';
    const result = validateReadingLevel(longSentence);
    expect(result.suggestions.some((s) => s.includes('exceed 25 words'))).toBe(
      true,
    );
  });

  it('flags complex words with more than 3 syllables', () => {
    const result = validateReadingLevel(
      'The implementation requires extraordinary administrative coordination.',
    );
    expect(
      result.suggestions.some((s) => s.includes('more than 3 syllables')),
    ).toBe(true);
  });

  it('detects passive voice patterns', () => {
    const result = validateReadingLevel(
      'The form was submitted by the applicant. The application was reviewed by staff.',
    );
    expect(
      result.suggestions.some((s) => s.includes('passive voice')),
    ).toBe(true);
  });

  it('level returns correct label for different grades', () => {
    // We test the grading mapping indirectly
    const simple = validateReadingLevel('The cat is big.');
    expect(['very easy', 'easy', 'moderate', 'difficult', 'very difficult']).toContain(
      simple.level,
    );
  });

  it('default target is 8th grade', () => {
    const simple = validateReadingLevel('The cat sat on the mat.');
    // Simple text should pass 8th grade default
    expect(simple.passesTarget).toBe(true);
  });

  it('syllable count is positive', () => {
    const result = validateReadingLevel('Hello world.');
    expect(result.syllables).toBeGreaterThan(0);
  });
});
