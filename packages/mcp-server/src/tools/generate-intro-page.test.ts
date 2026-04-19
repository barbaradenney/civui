import { describe, it, expect } from 'vitest';
import { generateIntroPage } from './generate-intro-page.js';
import { getFormDefinition } from '../resources/va-form-registry.js';

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

  it('includes process list with 4 steps', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('Check your eligibility');
    expect(result.html).toContain('Gather your information');
    expect(result.html).toContain('Start your application');
    expect(result.html).toContain('Submit your application');
  });

  it('includes preparation items', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('Social Security number');
    expect(result.html).toContain('DD214');
  });

  it('includes respondent burden', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('25 minutes');
  });

  it('includes OMB number', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('2900-0747');
  });

  it('includes sign-in alert', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('Sign in');
  });

  it('includes need help section', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('Need help');
    expect(result.html).toContain('800-827-1000');
  });

  it('includes start button', () => {
    const result = generateIntroPage(form);
    expect(result.html).toContain('civ-button');
    expect(result.html).toContain('Start your application');
  });

  it('returns features array', () => {
    const result = generateIntroPage(form);
    expect(result.features).toContain('intro-page');
    expect(result.features).toContain('process-list');
  });
});
