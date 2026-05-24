import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type ActivityIntent = 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type TimestampFormat = 'relative' | 'absolute' | 'both';

const INTENT_DEFAULT_ICON: Record<ActivityIntent, string> = {
  success: 'check',
  info: 'info',
  warning: 'warning',
  error: 'error',
  neutral: '',
};

/**
 * CivUI Activity Item
 *
 * A single entry inside `<civ-activity-timeline>`. Renders the rail
 * dot + connecting segment on the leading edge, then a stack of
 * timestamp / actor / action / optional comment body on the trailing
 * edge.
 *
 * The timestamp is always wrapped in a `<time datetime="...">` so it
 * is machine-readable. The visual format is controlled by
 * `timestamp-format`:
 *
 * - `relative` — "3 hours ago"
 * - `absolute` — "Jan 15, 2026, 10:30 AM"
 * - `both` — absolute first with relative in muted parentheses (default)
 *
 * Intent drives the dot color and the default icon inside the dot.
 * Pass `icon=""` (empty) to suppress the default icon and show a
 * plain colored dot, or pass `icon="some-name"` to override.
 *
 * The rail uses `aria-hidden` so screen readers hear only the
 * timestamp + actor + action + body content, not the decorative
 * dot/line geometry.
 *
 * @element civ-activity-item
 *
 * @prop {string} timestamp - ISO 8601 timestamp string. Required for
 *   the time wrapper to be valid.
 * @prop {TimestampFormat} timestampFormat - Visual format
 *   (default: 'both').
 * @prop {string} actor - Person or system that took the action.
 * @prop {string} action - Short action label (required).
 * @prop {ActivityIntent} intent - Semantic color (default: 'neutral').
 * @prop {string} icon - Override icon name. Empty string suppresses
 *   the default intent icon and shows a plain dot.
 *
 * @slot - Optional comment/detail body shown under the action label.
 */
@customElement('civ-activity-item')
export class CivActivityItem extends LightDomSlotMixin(CivBaseElement) {
  /** ISO 8601 timestamp string. */
  @property({ type: String }) timestamp = '';

  /** Visual timestamp format. */
  @property({ type: String, attribute: 'timestamp-format' })
  timestampFormat: TimestampFormat = 'both';

  /** Person or system that took the action. */
  @property({ type: String }) actor = '';

  /** Short action label. */
  @property({ type: String }) action = '';

  /** Semantic color. */
  @property({ type: String, reflect: true })
  intent: ActivityIntent = 'neutral';

  /** Override icon name. Empty string suppresses the default icon. */
  @property({ type: String }) icon: string | null = null;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-activity-item-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  /** Resolve the icon name shown inside the dot. Empty string means
   *  "no icon — plain dot". */
  private get _resolvedIcon(): string {
    if (this.icon !== null) return this.icon;
    return INTENT_DEFAULT_ICON[this.intent] ?? '';
  }

  /** Build the absolute display: "Jan 15, 2026, 10:30 AM" — uses
   *  the user's locale when the string is a parseable ISO date.
   *  Returns the raw value as a fallback. */
  private get _absoluteLabel(): string {
    if (!this.timestamp) return '';
    const parsed = new Date(this.timestamp);
    if (Number.isNaN(parsed.getTime())) return this.timestamp;
    return parsed.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  /** Build the relative display: "3 hours ago", "in 2 days", etc.
   *  Uses Intl.RelativeTimeFormat. Returns empty string if the
   *  timestamp can't be parsed. */
  private get _relativeLabel(): string {
    if (!this.timestamp) return '';
    const parsed = new Date(this.timestamp);
    if (Number.isNaN(parsed.getTime())) return '';

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const diffMs = parsed.getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    const abs = Math.abs(diffSec);

    if (abs < 60) return rtf.format(diffSec, 'second');
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
    if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day');
    if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month');
    return rtf.format(Math.round(diffSec / 31536000), 'year');
  }

  private _renderTimestamp() {
    if (!this.timestamp) return nothing;
    const fmt = this.timestampFormat;
    const abs = this._absoluteLabel;
    const rel = this._relativeLabel;

    let primary = '';
    let secondary = '';
    if (fmt === 'relative') {
      primary = rel || abs;
    } else if (fmt === 'absolute') {
      primary = abs;
    } else {
      primary = abs;
      secondary = rel;
    }

    return html`
      <time
        class="civ-activity-item__timestamp"
        datetime="${this.timestamp}"
      >${primary}${secondary
        ? html` <span class="civ-activity-item__timestamp-relative">(${secondary})</span>`
        : nothing}</time>
    `;
  }

  override render() {
    const iconName = this._resolvedIcon;

    return html`
      <div class="civ-activity-item">
        <div
          class="civ-activity-item__rail"
          aria-hidden="true"
        >
          <span class="civ-activity-item__dot">
            ${iconName
              ? html`<civ-icon
                  class="civ-activity-item__dot-icon"
                  name="${iconName}"
                ></civ-icon>`
              : nothing}
          </span>
          <span class="civ-activity-item__line"></span>
        </div>

        <div class="civ-activity-item__content">
          ${this._renderTimestamp()}
          ${this.actor
            ? html`<span class="civ-activity-item__actor">${this.actor}</span>`
            : nothing}
          <span class="civ-activity-item__action">${this.action}</span>
          <div
            class="civ-activity-item__body"
            data-civ-activity-item-content
          ></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-activity-item': CivActivityItem;
  }
}
