import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type TimelineIntent = 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type TimestampFormat = 'relative' | 'absolute' | 'both';

const INTENT_DEFAULT_ICON: Record<TimelineIntent, string> = {
  success: 'check',
  info: 'info',
  warning: 'warning',
  error: 'error',
  neutral: '',
};

/**
 * CivUI Timeline Item
 *
 * A single entry inside `<civ-timeline>`. Renders the rail dot +
 * connecting segment on the leading edge, then a stack of timestamp /
 * actor / action / optional comment body on the trailing edge.
 *
 * The timestamp is wrapped in a `<time datetime="...">` when parseable
 * so it is machine-readable. The visual format is controlled by
 * `timestamp-format`:
 *
 * - `relative` — "3 hours ago"
 * - `absolute` — "Jan 15, 2026, 10:30 AM"
 * - `both` — absolute first with relative in muted parentheses (default)
 *
 * Intent drives the dot color and the default icon inside the dot.
 * Pass `icon=""` (empty string) to suppress the default icon and
 * show a plain colored dot, or pass `icon="some-name"` to override.
 * The property defaults to `null` / `undefined` meaning "use intent
 * default"; only an empty-string value (set via attribute or JS)
 * counts as the explicit suppression sentinel.
 *
 * The `actor` field is optional and generic — use it for whoever (or
 * whatever) is responsible for the entry: a person, a system, a
 * department, a version number, a milestone label.
 *
 * The rail uses `aria-hidden` so screen readers hear only the
 * timestamp + actor + action + body content, not the decorative
 * dot/line geometry.
 *
 * @element civ-timeline-item
 *
 * @prop {string} timestamp - ISO 8601 timestamp string. Required for
 *   the time wrapper to be valid.
 * @prop {TimestampFormat} timestampFormat - Visual format
 *   (default: 'both').
 * @prop {string} actor - Person, system, or label associated with
 *   the entry. Optional.
 * @prop {string} action - Short action label (required).
 * @prop {TimelineIntent} intent - Semantic color (default: 'neutral').
 * @prop {string} icon - Override icon name. Empty string suppresses
 *   the default intent icon and shows a plain dot.
 *
 * @slot - Optional comment/detail body shown under the action label.
 */
@customElement('civ-timeline-item')
export class CivTimelineItem extends LightDomSlotMixin(CivBaseElement) {
  /** ISO 8601 timestamp string. */
  @property({ type: String }) timestamp = '';

  /** Visual timestamp format. */
  @property({ type: String, attribute: 'timestamp-format' })
  timestampFormat: TimestampFormat = 'both';

  /** Person, system, or label associated with the entry. */
  @property({ type: String }) actor = '';

  /** Short action label. */
  @property({ type: String }) action = '';

  /** Semantic color. */
  @property({ type: String, reflect: true })
  intent: TimelineIntent = 'neutral';

  /** Override icon name. Empty string suppresses the default icon. */
  @property({ type: String }) icon: string | null | undefined = null;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-timeline-item-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  /** Resolve the icon name shown inside the dot. Empty string means
   *  "no icon — plain dot". Both `null` and `undefined` are treated
   *  as "use the intent's default icon" so JS consumers passing
   *  `undefined` don't accidentally render `name="undefined"`. */
  private get _resolvedIcon(): string {
    // Loose equality `== null` matches both null and undefined.
    if (this.icon == null) return INTENT_DEFAULT_ICON[this.intent] ?? '';
    return this.icon;
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

    // Comparing the ROUNDED value (not raw seconds) against the next-unit
    // boundary avoids "60 minutes ago" / "24 hours ago" / "30 days ago"
    // edge cases where Math.round(diffSec / 60) lands on exactly the
    // next-unit's boundary inside the smaller-unit branch.
    const seconds = diffSec;
    if (Math.abs(seconds) < 60) return rtf.format(seconds, 'second');
    const minutes = Math.round(diffSec / 60);
    if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
    const hours = Math.round(diffSec / 3600);
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
    const days = Math.round(diffSec / 86400);
    if (Math.abs(days) < 30) return rtf.format(days, 'day');
    const months = Math.round(diffSec / 2592000);
    if (Math.abs(months) < 12) return rtf.format(months, 'month');
    const years = Math.round(diffSec / 31536000);
    return rtf.format(years, 'year');
  }

  private _renderTimestamp() {
    if (!this.timestamp) return nothing;
    const fmt = this.timestampFormat;
    const abs = this._absoluteLabel;
    const rel = this._relativeLabel;
    // Skip the <time> wrapper when the value can't be parsed — HTML5
    // forbids invalid datetime attributes, and assistive tech that
    // consumes <time datetime> would otherwise either skip the element
    // or speak the raw garbage. Render as a plain <span> in that case.
    const isValid = !Number.isNaN(new Date(this.timestamp).getTime());

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

    const inner = html`${primary}${secondary
      ? html` <span class="civ-timeline-item__timestamp-relative">(${secondary})</span>`
      : nothing}`;

    if (!isValid) {
      return html`<span class="civ-timeline-item__timestamp">${inner}</span>`;
    }
    return html`<time class="civ-timeline-item__timestamp" datetime="${this.timestamp}">${inner}</time>`;
  }

  override render() {
    const iconName = this._resolvedIcon;

    return html`
      <div class="civ-timeline-item">
        <div
          class="civ-timeline-item__rail"
          aria-hidden="true"
        >
          <span class="civ-timeline-item__dot">
            ${iconName
              ? html`<civ-icon
                  class="civ-timeline-item__dot-icon"
                  name="${iconName}"
                ></civ-icon>`
              : nothing}
          </span>
          <span class="civ-timeline-item__line"></span>
        </div>

        <div class="civ-timeline-item__content">
          ${this._renderTimestamp()}
          ${this.actor
            ? html`<span class="civ-timeline-item__actor">${this.actor}</span>`
            : nothing}
          <span class="civ-timeline-item__action">${this.action}</span>
          <div
            class="civ-timeline-item__body"
            data-civ-timeline-item-content
          ></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-timeline-item': CivTimelineItem;
  }
}
