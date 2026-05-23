// Schema: packages/schema/src/components/civ-side-nav-heading.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, warnInvalidProp } from '@civui/core';

/**
 * CivUI Side Nav Heading
 *
 * A non-interactive section header that labels a group of
 * `<civ-side-nav-item>` siblings. Modeled on the VA Design System's
 * side-nav section headers — small uppercase muted text that groups
 * related links by topic. Use when a sidebar has multiple distinct
 * categories that themselves aren't navigation targets ("GETTING
 * STARTED" / "COMPONENTS" / "FOUNDATIONS"), or when the disclosure
 * parent's chevron is misleading because the children are always
 * visible.
 *
 * The host is non-focusable and not interactive — purely a visual /
 * semantic group label. It gets `role="presentation"` so screen
 * readers don't announce it as a list item inside the surrounding
 * `<ul>`.
 *
 * `headingLevel` (1–6) optionally wraps the label in an `<h1>`–`<h6>`
 * so screen-reader rotor users can jump between sections. Visual
 * treatment stays constant regardless of level — heading-level only
 * affects AT navigation, not the rendered font size or weight. Same
 * pattern as `<civ-accordion-item>`.
 *
 * @element civ-side-nav-heading
 *
 * @prop {string} label - Visible header text. Required.
 * @prop {number} headingLevel - 1–6 wraps the label in `<h1>`–`<h6>` for screen-reader rotor navigation. Values outside the range trigger a dev-mode warning and fall back to a `<span>`. Web-only.
 */
@customElement('civ-side-nav-heading')
export class CivSideNavHeading extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  private _invalidLevelWarned = false;

  override connectedCallback(): void {
    super.connectedCallback();
    // role="presentation" so the host doesn't get announced as a
    // list item when it sits inside the parent `<ul>` — it's a
    // group label, not a list entry.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'presentation');
  }

  override render() {
    const level = this.headingLevel;
    const valid =
      typeof level === 'number' &&
      Number.isInteger(level) &&
      level >= 1 &&
      level <= 6;

    if (level !== undefined && !valid && !this._invalidLevelWarned) {
      warnInvalidProp(
        this.tagName.toLowerCase(),
        'heading-level',
        String(level),
        'an integer between 1 and 6 (falling back to a plain <span>)',
      );
      this._invalidLevelWarned = true;
    }

    if (valid) {
      // Use a switch so the static Lit template strings cover every
      // valid heading level. A dynamic tag name (`<h${level}>`)
      // isn't supported by lit-html templates.
      switch (level) {
        case 1: return html`<h1 class="civ-side-nav__heading">${this.label}</h1>`;
        case 2: return html`<h2 class="civ-side-nav__heading">${this.label}</h2>`;
        case 3: return html`<h3 class="civ-side-nav__heading">${this.label}</h3>`;
        case 4: return html`<h4 class="civ-side-nav__heading">${this.label}</h4>`;
        case 5: return html`<h5 class="civ-side-nav__heading">${this.label}</h5>`;
        case 6: return html`<h6 class="civ-side-nav__heading">${this.label}</h6>`;
      }
    }

    return html`<span class="civ-side-nav__heading">${this.label}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-side-nav-heading': CivSideNavHeading;
  }
}
