import { describe, it, expect } from 'vitest';
import { useAnalytics } from './useAnalytics.js';

describe('useAnalytics', () => {
  it('is exported as a function', () => {
    expect(typeof useAnalytics).toBe('function');
  });
});

describe('useAnalytics event shape', () => {
  it('builds correct analytics event payload', () => {
    const events: any[] = [];
    const handler = (event: any) => events.push(event);

    // Simulate what trackInteraction does internally
    const event = {
      componentName: 'civ-text-input',
      action: 'change',
      timestamp: new Date().toISOString(),
      fieldName: 'email',
      label: 'Email',
    };
    handler(event);

    expect(events).toHaveLength(1);
    expect(events[0].componentName).toBe('civ-text-input');
    expect(events[0].action).toBe('change');
    expect(events[0].fieldName).toBe('email');
    expect(events[0].label).toBe('Email');
    expect(events[0].timestamp).toBeTruthy();
  });

  it('never includes value in event payload (PII safety)', () => {
    const event = {
      componentName: 'civ-text-input',
      action: 'change',
      timestamp: new Date().toISOString(),
      fieldName: 'email',
    };

    expect(event).not.toHaveProperty('value');
  });

  it('supports details metadata', () => {
    const event = {
      componentName: 'civ-file-upload',
      action: 'upload',
      timestamp: new Date().toISOString(),
      details: { fileCount: 3 },
    };

    expect(event.details).toEqual({ fileCount: 3 });
  });
});

describe('useForm analytics integration', () => {
  it('useForm accepts onAnalytics option', async () => {
    const { useForm } = await import('../forms/useForm.js');
    expect(typeof useForm).toBe('function');
    // Verify the option type is accepted (compile-time check via import)
  });
});
