import { describe, it, expect } from 'vitest';
import { scaffoldFromTemplate } from './scaffold-from-template.js';

describe('scaffoldFromTemplate', () => {
  it('returns a schema for exact name match', () => {
    const result = scaffoldFromTemplate('Contact Form');
    expect(result.templateName).toBe('Contact Form');
    expect(result.schema.title).toBe('Contact Us');
    expect(result.fieldCount).toBeGreaterThan(0);
    expect(result.sectionCount).toBeGreaterThan(0);
  });

  it('matches case-insensitively', () => {
    const result = scaffoldFromTemplate('contact form');
    expect(result.templateName).toBe('Contact Form');
  });

  it('matches partial name', () => {
    const result = scaffoldFromTemplate('contact');
    expect(result.templateName).toBe('Contact Form');
  });

  it('applies title override', () => {
    const result = scaffoldFromTemplate('Contact Form', { title: 'My Form' });
    expect(result.schema.title).toBe('My Form');
  });

  it('applies action and method overrides', () => {
    const result = scaffoldFromTemplate('Contact Form', {
      action: '/custom/endpoint',
      method: 'PUT',
    });
    expect(result.schema.action).toBe('/custom/endpoint');
    expect(result.schema.method).toBe('PUT');
  });

  it('throws for unknown template with available names', () => {
    expect(() => scaffoldFromTemplate('nonexistent')).toThrow(
      /Unknown template "nonexistent"/,
    );
    expect(() => scaffoldFromTemplate('nonexistent')).toThrow(
      /Available templates:/,
    );
  });

  it('parses Benefits Application template', () => {
    const result = scaffoldFromTemplate('Benefits Application');
    expect(result.templateName).toBe('Benefits Application');
    expect(result.schema.sections.length).toBeGreaterThanOrEqual(2);
  });

  it('parses Change of Address template', () => {
    const result = scaffoldFromTemplate('Change of Address');
    expect(result.templateName).toBe('Change of Address');
  });

  it('parses Document Submission template', () => {
    const result = scaffoldFromTemplate('Document Submission');
    expect(result.templateName).toBe('Document Submission');
  });

  it('parses Feedback Form template', () => {
    const result = scaffoldFromTemplate('Feedback Form');
    expect(result.templateName).toBe('Feedback Form');
  });

  it('detects workflow feature', () => {
    const result = scaffoldFromTemplate('Benefits Application with Review Workflow');
    expect(result.features).toContain('workflow');
    expect(result.features).toContain('feedback');
    expect(result.features).toContain('multiActor');
    expect(result.features).toContain('sectionPermissions');
  });

  it('detects delegation feature', () => {
    const result = scaffoldFromTemplate('Petition with Delegation');
    expect(result.features).toContain('delegation');
    expect(result.features).toContain('workflow');
  });

  it('parses Building Permit template with all features', () => {
    const result = scaffoldFromTemplate('Building Permit');
    expect(result.templateName).toContain('Building Permit');
    expect(result.features).toContain('workflow');
    expect(result.features).toContain('delegation');
    expect(result.features).toContain('feedback');
  });

  it('returns accurate fieldCount and sectionCount', () => {
    const result = scaffoldFromTemplate('Contact Form');
    // Contact form: full-name, email, phone, topic, message = 5 fields, 1 section
    expect(result.fieldCount).toBe(5);
    expect(result.sectionCount).toBe(1);
  });

  it('all 8 templates parse successfully', () => {
    const templateNames = [
      'Contact Form',
      'Benefits Application',
      'Change of Address',
      'Document Submission',
      'Feedback Form',
      'Benefits Application with Review Workflow',
      'Petition with Delegation',
      'Building Permit',
    ];
    for (const name of templateNames) {
      const result = scaffoldFromTemplate(name);
      expect(result.schema.sections.length).toBeGreaterThan(0);
      expect(result.fieldCount).toBeGreaterThan(0);
    }
  });
});
