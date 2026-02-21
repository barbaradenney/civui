import { describe, it, expect, afterEach, vi } from 'vitest';
import { CivdsBaseElement } from '../base/civds-base-element.js';
import { CivdsFormElement } from '../base/civds-form-element.js';
import { ANALYTICS_EVENT_NAME } from './analytics-types.js';

// Register test elements
class TestBase extends CivdsBaseElement {
  name = 'test-field';
  label = 'Test Label';

  fireAnalytics(action: any, details?: any) {
    this.sendAnalytics(action, details);
  }
}

class TestForm extends CivdsFormElement {
  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', (e: Event) => this._handleChange(e));
  }

  triggerChange() {
    // _handleChange reads e.target.value, so dispatch from a real input
    const input = document.createElement('input');
    input.value = 'new-value';
    this.appendChild(input);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

if (!customElements.get('test-analytics-base')) {
  customElements.define('test-analytics-base', TestBase);
}
if (!customElements.get('test-analytics-form')) {
  customElements.define('test-analytics-form', TestForm);
}

function cleanup(): void {
  document.body.innerHTML = '';
}

afterEach(cleanup);

describe('sendAnalytics', () => {
  it('dispatches civds-analytics event with correct payload', () => {
    const el = document.createElement('test-analytics-base') as TestBase;
    document.body.appendChild(el);

    const handler = vi.fn();
    el.addEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);

    el.fireAnalytics('change');

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('test-analytics-base');
    expect(detail.action).toBe('change');
    expect(detail.fieldName).toBe('test-field');
    expect(detail.label).toBe('Test Label');
    expect(detail.timestamp).toBeTruthy();
  });

  it('includes details when provided', () => {
    const el = document.createElement('test-analytics-base') as TestBase;
    document.body.appendChild(el);

    const handler = vi.fn();
    el.addEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);

    el.fireAnalytics('upload', { fileCount: 3 });

    const detail = handler.mock.calls[0][0].detail;
    expect(detail.details).toEqual({ fileCount: 3 });
  });

  it('does not fire when disableAnalytics is true', () => {
    const el = document.createElement('test-analytics-base') as TestBase;
    el.disableAnalytics = true;
    document.body.appendChild(el);

    const handler = vi.fn();
    el.addEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);

    el.fireAnalytics('change');

    expect(handler).not.toHaveBeenCalled();
  });

  it('event bubbles and is composed', () => {
    const el = document.createElement('test-analytics-base') as TestBase;
    document.body.appendChild(el);

    const handler = vi.fn();
    document.body.addEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);

    el.fireAnalytics('change');

    expect(handler).toHaveBeenCalledOnce();
    document.body.removeEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);
  });

  it('timestamp is valid ISO 8601', () => {
    const el = document.createElement('test-analytics-base') as TestBase;
    document.body.appendChild(el);

    const handler = vi.fn();
    el.addEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);

    el.fireAnalytics('change');

    const timestamp = handler.mock.calls[0][0].detail.timestamp;
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('never includes value property in payload (PII safety)', () => {
    const el = document.createElement('test-analytics-base') as TestBase;
    document.body.appendChild(el);

    const handler = vi.fn();
    el.addEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);

    el.fireAnalytics('change');

    const detail = handler.mock.calls[0][0].detail;
    expect(detail).not.toHaveProperty('value');
  });
});

describe('CivdsFormElement analytics integration', () => {
  it('fires analytics on _handleChange', async () => {
    const el = document.createElement('test-analytics-form') as TestForm;
    el.label = 'Email';
    el.name = 'email';
    document.body.appendChild(el);
    await (el as any).updateComplete;

    const handler = vi.fn();
    el.addEventListener(ANALYTICS_EVENT_NAME, handler as EventListener);

    el.triggerChange();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.action).toBe('change');
    expect(detail.componentName).toBe('test-analytics-form');
  });
});
