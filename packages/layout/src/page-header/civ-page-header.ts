import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, devWarn } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Page Header
 *
 * A structured page heading with four slot areas: tag, eyebrow,
 * heading, and subheading. Use data-* attributes to assign children.
 *
 * @element civ-page-header
 * @prop {string} rhythm - Bottom margin to the following content: 'default' (24px) or 'sm' (12px)
 * @prop {string} spacing - **Deprecated** — use `rhythm` instead. Same values, same effect. Removed in a future release.
 */
@customElement('civ-page-header')
export class CivPageHeader extends LightDomSlotMixin(CivBaseElement) {
  /**
   * Bottom margin to the following content. `default` (24px,
   * `civ-mb-6`) or `sm` (12px, `civ-mb-3`). The page-header has
   * no internal padding of its own — this is a vertical-rhythm
   * control between the header block and the content below.
   *
   * Named `rhythm` (not `spacing`) to avoid the density-convention
   * trap where `spacing` everywhere else means "internal padding."
   * See `.claude/rules/density-convention.md` "Three things
   * `spacing='sm'` MUST NOT mean."
   */
  @property({ type: String }) rhythm: 'default' | 'sm' = 'default';

  /**
   * @deprecated Use `rhythm` instead. Same allowed values, same
   * effect — both produce the `civ-page-header--sm` modifier class
   * when set to `'sm'`. The `spacing` prop will be removed in a
   * future release; setting it to a non-default value emits a
   * one-time dev-mode console warning.
   */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';
  /** Icon name to render before the heading. */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';
  /** Icon name to render after the heading. */
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';

  override _getSlotConfig(): SlotConfig {
    return {
      'data-tag': '[data-civ-page-header-tag]',
      'data-eyebrow': '[data-civ-page-header-eyebrow]',
      'data-heading': '[data-civ-page-header-heading]',
      'data-subheading': '[data-civ-page-header-subheading]',
      'data-header-start': '[data-civ-page-header-start]',
      'data-header-end': '[data-civ-page-header-end]',
      default: '[data-civ-page-header-heading]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    if (this.spacing !== 'default') {
      devWarn(
        'civ-page-header',
        '`spacing` is deprecated and will be removed in a future release. Use `rhythm` instead — same allowed values, same effect. The rename clarifies that this prop controls margin between the header and the content below, not internal padding.',
        'civ-page-header:spacing-deprecated',
      );
    }
    const isSm = this.rhythm === 'sm' || this.spacing === 'sm';
    const hasStart = this.iconStart || this._hasSlottedChildren('data-header-start');
    const hasEnd = this.iconEnd || this._hasSlottedChildren('data-header-end');
    const hasFlank = hasStart || hasEnd;

    return html`
      <div class="${[
        'civ-page-header',
        isSm ? 'civ-page-header--sm' : '',
      ].filter(Boolean).join(' ')}">
        ${this._hasSlottedChildren('data-tag') ? html`
          <div class="civ-page-header__tag" data-civ-page-header-tag></div>
        ` : nothing}
        ${this._hasSlottedChildren('data-eyebrow') ? html`
          <div class="civ-page-header__eyebrow" data-civ-page-header-eyebrow></div>
        ` : nothing}
        ${hasFlank ? html`
          <div class="civ-page-header__heading-layout">
            ${hasStart ? html`
              <div class="civ-page-header__start" data-civ-page-header-start>
                ${this.iconStart && !this._hasSlottedChildren('data-header-start')
                  ? html`<civ-icon class="civ-page-header__icon" name="${this.iconStart}" aria-hidden="true"></civ-icon>`
                  : nothing}
              </div>
            ` : nothing}
            <div class="civ-page-header__heading" data-civ-page-header-heading></div>
            ${hasEnd ? html`
              <div class="civ-page-header__end" data-civ-page-header-end>
                ${this.iconEnd && !this._hasSlottedChildren('data-header-end')
                  ? html`<civ-icon class="civ-page-header__icon" name="${this.iconEnd}" aria-hidden="true"></civ-icon>`
                  : nothing}
              </div>
            ` : nothing}
          </div>
        ` : html`
          <div class="civ-page-header__heading" data-civ-page-header-heading></div>
        `}
        ${this._hasSlottedChildren('data-subheading') ? html`
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
