/**
 * validate_reading_level tool — Flesch-Kincaid readability scoring with
 * grade-level targeting and plain-language suggestions.
 */

export interface ReadingLevelResult {
  score: number;
  gradeLevel: number;
  level: string;
  sentences: number;
  words: number;
  syllables: number;
  passesTarget: boolean;
  suggestions: string[];
}

/** Count syllables in a word using a vowel-group heuristic. */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) return 1;

  // Count vowel groups
  const vowelGroups = w.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Silent 'e' at end
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) {
    count--;
  }

  // -ed at end (except -ted, -ded)
  if (w.endsWith('ed') && !w.endsWith('ted') && !w.endsWith('ded') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

/** Split text into sentences by ., !, ? boundaries. */
function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

/** Split text into words. */
function getWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

/** Detect likely passive voice patterns (was/were + past participle). */
function findPassiveVoice(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const passivePattern = /\b(was|were|is|are|been|being|be)\s+\w+ed\b/i;
  return sentences
    .filter((s) => passivePattern.test(s))
    .map((s) => s.trim());
}

function gradeToLevel(grade: number): string {
  if (grade <= 5) return 'very easy';
  if (grade <= 8) return 'easy';
  if (grade <= 12) return 'moderate';
  if (grade <= 16) return 'difficult';
  return 'very difficult';
}

export function validateReadingLevel(
  text: string,
  options?: { targetGradeLevel?: number },
): ReadingLevelResult {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for readability analysis');
  }

  const targetGrade = options?.targetGradeLevel ?? 8;

  const words = getWords(text);
  const sentenceCount = Math.max(1, countSentences(text));
  const wordCount = words.length;
  if (wordCount === 0) {
    throw new Error('Text is required for readability analysis');
  }
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  // Flesch-Kincaid Grade Level
  const gradeLevel =
    0.39 * (wordCount / sentenceCount) +
    11.8 * (syllableCount / wordCount) -
    15.59;

  // Flesch Reading Ease
  const score =
    206.835 -
    1.015 * (wordCount / sentenceCount) -
    84.6 * (syllableCount / wordCount);

  const roundedGrade = Math.round(gradeLevel * 10) / 10;
  const roundedScore = Math.round(score * 10) / 10;

  const suggestions: string[] = [];

  // Flag long sentences (>25 words)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const longSentences = sentences.filter(
    (s) => getWords(s.trim()).length > 25,
  );
  if (longSentences.length > 0) {
    suggestions.push(
      `${longSentences.length} sentence(s) exceed 25 words. Consider splitting them.`,
    );
  }

  // Flag complex words (>3 syllables)
  const complexWords = words.filter((w) => countSyllables(w) > 3);
  const uniqueComplex = [...new Set(complexWords.map((w) => w.toLowerCase()))];
  if (uniqueComplex.length > 0) {
    const examples = uniqueComplex.slice(0, 5).join(', ');
    suggestions.push(
      `${uniqueComplex.length} word(s) have more than 3 syllables: ${examples}. Consider simpler alternatives.`,
    );
  }

  // Flag passive voice
  const passiveSentences = findPassiveVoice(text);
  if (passiveSentences.length > 0) {
    suggestions.push(
      `${passiveSentences.length} sentence(s) may use passive voice. Consider using active voice.`,
    );
  }

  return {
    score: roundedScore,
    gradeLevel: roundedGrade,
    level: gradeToLevel(roundedGrade),
    sentences: sentenceCount,
    words: wordCount,
    syllables: syllableCount,
    passesTarget: roundedGrade <= targetGrade,
    suggestions,
  };
}
