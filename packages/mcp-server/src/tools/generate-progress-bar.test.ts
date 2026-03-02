import { describe, it, expect } from 'vitest';
import { generateProgressBar } from './generate-progress-bar.js';

const steps = [
  { id: 'info', label: 'Personal Info' },
  { id: 'address', label: 'Address' },
  { id: 'review', label: 'Review' },
];

describe('generateProgressBar', () => {
  it('throws when steps array is empty', () => {
    expect(() => generateProgressBar([], 'info')).toThrow(
      'At least one step is required',
    );
  });

  it('throws when currentStep is not found', () => {
    expect(() => generateProgressBar(steps, 'missing')).toThrow(
      'Step "missing" not found in steps',
    );
  });

  it('returns html, javascript, features, stepCount, currentIndex', () => {
    const result = generateProgressBar(steps, 'address');
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('stepCount');
    expect(result).toHaveProperty('currentIndex');
    expect(result.stepCount).toBe(3);
    expect(result.currentIndex).toBe(1);
  });

  it('renders nav with aria-label and ol', () => {
    const result = generateProgressBar(steps, 'info');
    expect(result.html).toContain('<nav data-civ-progress aria-label="Progress">');
    expect(result.html).toContain('<ol');
    expect(result.html).toContain('</ol>');
    expect(result.html).toContain('</nav>');
  });

  it('marks current step with aria-current="step"', () => {
    const result = generateProgressBar(steps, 'address');
    expect(result.html).toContain('data-civ-step="address"');
    expect(result.html).toContain('aria-current="step"');
  });

  it('completed steps have success class and checkmark', () => {
    const result = generateProgressBar(steps, 'review');
    // 'info' and 'address' are complete
    expect(result.html).toContain('civ-bg-success');
    expect(result.html).toContain('✓');
  });

  it('current step has primary class', () => {
    const result = generateProgressBar(steps, 'address');
    // The current step li should have primary background
    const lines = result.html.split('\n');
    const addressLine = lines.find((l) => l.includes('data-civ-step="address"'));
    expect(addressLine).toContain('civ-bg-primary');
  });

  it('upcoming steps have base-lighter class', () => {
    const result = generateProgressBar(steps, 'info');
    // 'address' and 'review' are upcoming
    const lines = result.html.split('\n');
    const addressLine = lines.find((l) => l.includes('data-civ-step="address"'));
    expect(addressLine).toContain('civ-bg-base-lighter');
  });

  it('features include progress-bar, step-indicators, aria-current', () => {
    const result = generateProgressBar(steps, 'info');
    expect(result.features).toContain('progress-bar');
    expect(result.features).toContain('step-indicators');
    expect(result.features).toContain('aria-current');
    expect(result.features).not.toContain('clickable');
  });

  it('clickable option adds clickable feature and buttons for completed steps', () => {
    const result = generateProgressBar(steps, 'review', { clickable: true });
    expect(result.features).toContain('clickable');
    expect(result.html).toContain('data-civ-step-btn="info"');
    expect(result.html).toContain('data-civ-step-btn="address"');
    expect(result.html).toContain('<button type="button"');
  });

  it('clickable JS dispatches civ-progress-navigate event', () => {
    const result = generateProgressBar(steps, 'review', { clickable: true });
    expect(result.javascript).toContain('civ-progress-navigate');
    expect(result.javascript).toContain('detail:');
  });

  it('non-clickable JS is minimal IIFE', () => {
    const result = generateProgressBar(steps, 'info');
    expect(result.javascript).toContain('(function()');
    expect(result.javascript).not.toContain('civ-progress-navigate');
  });
});
