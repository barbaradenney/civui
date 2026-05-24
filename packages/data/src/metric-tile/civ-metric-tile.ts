// Schema: packages/schema/src/components/civ-metric-tile.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type MetricTrend = 'up' | 'down' | 'flat' | '';
export type MetricIntent = 'positive' | 'negative' | 'neutral' | '';

/**
 * CivUI Metric Tile
 *
 * Display-only dashboard tile for a single key figure: a small label, a
 * large prominent value (with optional unit), an optional delta-from-
 * baseline indicator, and an optional description for context. Visual
 * hierarchy is inverted from `civ-card` — the value dominates, the
 * label rides above as a small caption.
 *
 * Intent and trend are independent on purpose. "Up" doesn't always mean
 * "good" — errors going up is bad, response time going down is good —
 * so `trend` controls the arrow direction and `intent` controls the
 * color. Set both when displaying a delta; omit `intent` for a neutral
 * (no-color) treatment.
 *
 * @element civ-metric-tile
 *
 * @prop {string} label - Small caption rendered above the value
 * @prop {string} value - The primary figure — rendered large and bold
 * @prop {string} unit - Optional unit string appended after the value (e.g. "ms", "applications")
 * @prop {string} icon - Optional icon name from the CivUI icon library, rendered before the label
 * @prop {string} description - Optional secondary text below the delta — extra context (e.g. "vs. last 30 days")
 * @prop {string} delta - Optional delta string (e.g. "+12%", "-3.2%", "+248")
 * @prop {MetricTrend} trend - Arrow direction next to the delta — `up`, `down`, or `flat`
 * @prop {MetricIntent} intent - Color treatment for the delta — `positive` (green), `negative` (red), `neutral` (no color)
 */
@customElement('civ-metric-tile')
export class CivMetricTile extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) unit = '';
  @property({ type: String }) icon = '';
  @property({ type: String }) description = '';
  @property({ type: String }) delta = '';
  @property({ type: String, reflect: true }) trend: MetricTrend = '';
  @property({ type: String, reflect: true }) intent: MetricIntent = '';

  private get _trendIcon(): string {
    if (this.trend === 'up') return 'arrow-up';
    if (this.trend === 'down') return 'arrow-down';
    if (this.trend === 'flat') return 'minus';
    return '';
  }

  private get _trendLabel(): string {
    if (this.trend === 'up') return 'Up';
    if (this.trend === 'down') return 'Down';
    if (this.trend === 'flat') return 'No change';
    return '';
  }

  override render() {
    const intentClass = this.intent ? `civ-metric-tile__delta--${this.intent}` : '';
    const trendIcon = this._trendIcon;
    const hasDelta = Boolean(this.delta) || Boolean(trendIcon);

    // The card chrome (border, padding, background, surface color) is
    // applied via the shared `civ-card civ-card--tertiary` classes so
    // every flat-card surface in CivUI has the same visual treatment.
    // Per the design rule "only interactive elements get rounded
    // corners", `civ-card` deliberately has no border-radius — the
    // metric tile inherits that flat treatment automatically.
    return html`
      <div class="civ-metric-tile civ-card civ-card--tertiary">
        <div class="civ-metric-tile__header">
          ${this.icon
            ? html`<civ-icon class="civ-metric-tile__icon" name="${this.icon}" aria-hidden="true"></civ-icon>`
            : nothing}
          ${this.label
            ? html`<span class="civ-metric-tile__label">${this.label}</span>`
            : nothing}
        </div>
        <div class="civ-metric-tile__value-row">
          <span class="civ-metric-tile__value">${this.value}</span>
          ${this.unit
            ? html`<span class="civ-metric-tile__unit">${this.unit}</span>`
            : nothing}
        </div>
        ${hasDelta
          ? html`
              <div class="civ-metric-tile__delta ${intentClass}">
                ${trendIcon
                  ? html`<civ-icon
                      class="civ-metric-tile__delta-icon"
                      name="${trendIcon}"
                      label="${this._trendLabel}"
                    ></civ-icon>`
                  : nothing}
                ${this.delta
                  ? html`<span class="civ-metric-tile__delta-text">${this.delta}</span>`
                  : nothing}
              </div>
            `
          : nothing}
        ${this.description
          ? html`<p class="civ-metric-tile__description">${this.description}</p>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-metric-tile': CivMetricTile;
  }
}
