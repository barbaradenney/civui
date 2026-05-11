import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { HeadingLevel, LabelSize } from '../templates/form-templates.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin that adds the standard `heading-level` and `size` properties used
 * by every component that renders its own legend or label. Applied to:
 *
 *  - Single inputs (text-input, textarea, select, combobox, date-picker,
 *    file-upload)
 *  - Self-contained group components (radio-group, checkbox-group,
 *    segmented-control, yes-no, memorable-date, date-range-picker)
 *  - Compound components (name, address, direct-deposit, signature,
 *    relationship, partnership-history, service-history, race-ethnicity)
 *  - Fieldset wrappers (civ-form-fieldset, civ-fieldset)
 *  - Other heading-bearing UI (modal, alert, form-step, repeater,
 *    section-intro, support-resources)
 *
 * Both properties are optional — undefined means "no heading promotion"
 * (default `<legend>` / `<label>` semantics) and "default body size".
 *
 * Use sparingly: heading promotion is typically only correct when the
 * control is the primary question on a single-question page (level 1)
 * or the top legend inside a form-step (level 2 or 3).
 */
export function LegendHeadingMixin<T extends Constructor<LitElement>>(superClass: T) {
  class LegendHeadingClass extends superClass {
    /**
     * Promote the legend / label to a heading via `role="heading"` +
     * `aria-level=N`. Use sparingly — typically only for the primary
     * question on a single-question page (level 1) or the top legend
     * inside a form-step (level 2 or 3).
     */
    @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

    /**
     * Visual size of the legend / label. Default (omitted) and `sm`
     * render at body size; `md`/`lg`/`xl` step up through the
     * typography scale for use as a section/page heading. At
     * `[data-civ-scale="fluid"]`, `xl` renders very large (clamp up
     * to ~2.6rem) — only use it when the legend is the page's primary
     * heading.
     */
    @property({ type: String }) size?: LabelSize;
  }
  return LegendHeadingClass as Constructor<{
    headingLevel?: HeadingLevel;
    size?: LabelSize;
  }> & T;
}
