import { describe, it, expect } from 'vitest';
import { generateIntroPage } from './generate-intro-page.js';
import { getFormDefinition } from '../resources/gov-form-registry.js';

describe('generateIntroPage', () => {
  const form = getFormDefinition('21-526EZ')!;

  it('generates HTML with form title', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('Apply for disability compensation');
  });

  it('includes form number', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('21-526EZ');
  });

  it('includes page header component', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('civ-page-header');
  });

  it('includes start button', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('civ-button');
    expect(result.html).toContain('Start your application');
  });

  it('includes placeholder text', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('Intro text goes here');
  });

  it('returns features array', () => {
    const result = generateIntroPage(form);
    expect(result.features).toContain('intro-page');
  });
});
