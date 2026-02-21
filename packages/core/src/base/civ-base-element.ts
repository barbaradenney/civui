import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { generateId } from '../utils/id-generator.js';
import { announce } from '../a11y/live-region.js';
import { dispatch } from '../utils/events.js';
import { ANALYTICS_EVENT_NAME } from '../analytics/analytics-types.js';
import type { AnalyticsAction, AnalyticsEventDetail } from '../analytics/analytics-types.js';

/**
 * Base element for all CivUI components.
 *
 * - Light DOM (no Shadow DOM) for maximum accessibility
 * - Unique ID generation for ARIA associations
 * - Screen reader announcement utility
 */
export class CivBaseElement extends LitElement {
  @property({ type: Boolean, attribute: 'disable-analytics' })
  disableAnalytics = false;

  /**
   * Render into Light DOM — no shadow root.
   * This ensures external labels, ARIA IDREFs, and focus management
   * all work without workarounds.
   */
  protected override createRenderRoot(): this {
    return this;
  }

  /**
   * Generate a unique ID, optionally with a suffix.
   * Used for label-for, aria-describedby, aria-labelledby associations.
   */
  protected generateId(suffix?: string): string {
    const base = generateId(this.tagName.toLowerCase());
    return suffix ? `${base}-${suffix}` : base;
  }

  /**
   * Announce a message to screen readers.
   */
  protected announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    announce(message, priority);
  }

  /**
   * Send an analytics event. Payloads never contain user input values (PII safety).
   * Only component metadata: tag name, field name, action type.
   */
  protected sendAnalytics(
    action: AnalyticsAction,
    details?: Record<string, string | number | boolean>,
  ): void {
    if (this.disableAnalytics) return;

    const self = this as any;
    const payload: AnalyticsEventDetail = {
      componentName: this.tagName.toLowerCase(),
      action,
      timestamp: new Date().toISOString(),
    };

    if (self.name) payload.fieldName = self.name;
    if (self.label) payload.label = self.label;
    if (self.legend) payload.label = self.legend;
    if (details) payload.details = details;

    dispatch(this, ANALYTICS_EVENT_NAME, payload);
  }
}
