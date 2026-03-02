import { describe, it, expect } from 'vitest';
import { generateHelpPanel } from './generate-help-panel.js';

const sections = [
  { id: 'ssn', heading: 'Social Security number', body: 'We use your SSN to verify your identity.' },
  { id: 'income', heading: 'Income', body: 'Enter your gross annual income before taxes.' },
];

describe('generateHelpPanel', () => {
  it('throws when sections array is empty', () => {
    expect(() => generateHelpPanel([])).toThrow(
      'At least one help section is required',
    );
  });

  it('returns html, javascript, features, sectionCount', () => {
    const result = generateHelpPanel(sections);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('sectionCount');
    expect(result.sectionCount).toBe(2);
  });

  // --- Sidebar mode ---
  it('sidebar mode renders aside with data-civ-help-panel', () => {
    const result = generateHelpPanel(sections, { mode: 'sidebar' });
    expect(result.html).toContain('<aside data-civ-help-panel');
    expect(result.html).toContain('</aside>');
  });

  it('sidebar mode renders toggle button with aria-expanded', () => {
    const result = generateHelpPanel(sections, { mode: 'sidebar' });
    expect(result.html).toContain('data-civ-help-toggle');
    expect(result.html).toContain('aria-expanded="false"');
    expect(result.html).toContain('aria-controls="civ-help-sidebar"');
  });

  it('sidebar mode renders details/summary for collapsible sections', () => {
    const result = generateHelpPanel(sections, { mode: 'sidebar' });
    expect(result.html).toContain('<details');
    expect(result.html).toContain('<summary');
    expect(result.html).toContain('Social Security number');
  });

  it('sidebar features include help-panel, sidebar, collapsible', () => {
    const result = generateHelpPanel(sections, { mode: 'sidebar' });
    expect(result.features).toContain('help-panel');
    expect(result.features).toContain('sidebar');
    expect(result.features).toContain('collapsible');
  });

  // --- Inline mode ---
  it('inline mode renders expandable blocks with data-civ-help-inline', () => {
    const result = generateHelpPanel(sections, { mode: 'inline' });
    expect(result.html).toContain('data-civ-help-inline');
    expect(result.html).toContain('More info:');
  });

  it('inline mode has aria-expanded and aria-controls on buttons', () => {
    const result = generateHelpPanel(sections, { mode: 'inline' });
    expect(result.html).toContain('aria-expanded="false"');
    expect(result.html).toContain('aria-controls=');
  });

  it('inline features include help-panel, inline, collapsible', () => {
    const result = generateHelpPanel(sections, { mode: 'inline' });
    expect(result.features).toContain('help-panel');
    expect(result.features).toContain('inline');
    expect(result.features).toContain('collapsible');
  });

  // --- Tooltip mode ---
  it('tooltip mode renders trigger buttons with ? and role="tooltip"', () => {
    const result = generateHelpPanel(sections, { mode: 'tooltip' });
    expect(result.html).toContain('data-civ-help-trigger');
    expect(result.html).toContain('role="tooltip"');
    expect(result.html).toContain('?</button>');
  });

  it('tooltip trigger has aria-describedby pointing to tooltip', () => {
    const result = generateHelpPanel(sections, { mode: 'tooltip' });
    expect(result.html).toContain('aria-describedby="tooltip-ssn"');
    expect(result.html).toContain('id="tooltip-ssn"');
  });

  it('tooltip features include help-panel, tooltip, keyboard-dismiss', () => {
    const result = generateHelpPanel(sections, { mode: 'tooltip' });
    expect(result.features).toContain('help-panel');
    expect(result.features).toContain('tooltip');
    expect(result.features).toContain('keyboard-dismiss');
  });

  it('tooltip JS handles Escape key', () => {
    const result = generateHelpPanel(sections, { mode: 'tooltip' });
    expect(result.javascript).toContain('Escape');
  });

  // --- General ---
  it('default mode is sidebar', () => {
    const result = generateHelpPanel(sections);
    expect(result.features).toContain('sidebar');
    expect(result.html).toContain('data-civ-help-panel');
  });

  it('JS dispatches civ-help-open and civ-help-close events', () => {
    const result = generateHelpPanel(sections);
    expect(result.javascript).toContain('civ-help-open');
    expect(result.javascript).toContain('civ-help-close');
  });
});
