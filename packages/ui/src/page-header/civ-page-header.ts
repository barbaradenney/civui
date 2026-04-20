import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Page Header
 *
 * A structured page heading with three slot areas: eyebrow, heading,
 * and subheading. Use `data-eyebrow`, `data-heading`, and `data-subheading`
 * attributes to assign children to each area.
 *
 * The heading slot supports inline content like tags next to the title.
 * Use `data-tag` for a tag above the eyebrow (stacked at the top).
 *
 * @element civ-page-header
 *
 * @example Full header with stacked tag
 * ```html
 * <civ-page-header>
 *   <civ-tag data-tag label="Active" variant="green" tag-style="primary"></civ-tag>
 *   <span data-eyebrow>Benefits</span>
 *   <h1 data-heading>
 *     Apply for disability compensation
 *     <civ-tag label="In progress" variant="teal"></civ-tag>
 *   </h1>
 *   <span data-subheading>VA Form 21-526EZ</span>
 * </civ-page-header>
 * ```
 *
 * @example Minimal header
 * ```html
 * <civ-page-header>
 *   <h1 data-heading>Dashboard</h1>
 * </civ-page-header>
 * ```
 */
@customElement('civ-page-header')
export class CivPageHeader extends CivBaseElement {
  private _tagChildren: Node[] = [];
  private _eyebrowChildren: Node[] = [];
  private _headingChildren: Node[] = [];
  private _subheadingChildren: Node[] = [];
  private _childrenSorted = false;

  override connectedCallback(): void {
    if (!this._childrenSorted) {
      for (const child of Array.from(this.childNodes)) {
        if (child instanceof Element) {
          if (child.hasAttribute('data-tag')) {
            this._tagChildren.push(child);
          } else if (child.hasAttribute('data-eyebrow')) {
            this._eyebrowChildren.push(child);
          } else if (child.hasAttribute('data-heading')) {
            this._headingChildren.push(child);
          } else if (child.hasAttribute('data-subheading')) {
            this._subheadingChildren.push(child);
          } else {
            this._headingChildren.push(child);
          }
        } else {
          this._headingChildren.push(child);
        }
      }
      this._childrenSorted = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    const tag = this.querySelector('[data-civ-page-header-tag]');
    if (tag) {
      for (const child of this._tagChildren) tag.appendChild(child);
    }
    const eyebrow = this.querySelector('[data-civ-page-header-eyebrow]');
    if (eyebrow) {
      for (const child of this._eyebrowChildren) eyebrow.appendChild(child);
    }
    const heading = this.querySelector('[data-civ-page-header-heading]');
    if (heading) {
      for (const child of this._headingChildren) heading.appendChild(child);
    }
    const subheading = this.querySelector('[data-civ-page-header-subheading]');
    if (subheading) {
      for (const child of this._subheadingChildren) subheading.appendChild(child);
    }
  }

  override render() {
    const hasTag = this._tagChildren.length > 0;
    const hasEyebrow = this._eyebrowChildren.length > 0;
    const hasSubheading = this._subheadingChildren.length > 0;

    return html`
      <div class="civ-page-header">
        ${hasTag ? html`
          <div class="civ-page-header__tag" data-civ-page-header-tag></div>
        ` : nothing}
        ${hasEyebrow ? html`
          <div class="civ-page-header__eyebrow" data-civ-page-header-eyebrow></div>
        ` : nothing}
        <div class="civ-page-header__heading" data-civ-page-header-heading></div>
        ${hasSubheading ? html`
          <div class="civ-page-header__subheading" data-civ-page-header-subheading></div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-page-header': CivPageHeader;
  }
}
