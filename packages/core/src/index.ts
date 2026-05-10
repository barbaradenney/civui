// Base classes
export { CivBaseElement } from './base/civ-base-element.js';
export { CivFormElement } from './base/civ-form-element.js';
export { CivBooleanFormElement } from './base/civ-boolean-form-element.js';
export { LightDomSlotMixin, LightDomTextMixin } from './base/light-dom-mixins.js';
export type { SlotConfig } from './base/light-dom-mixins.js';
export type { SelectLike } from './types/sub-components.js';
export { LegendHeadingMixin } from './base/legend-heading-mixin.js';
export { GroupListenerMixin } from './base/group-listener-mixin.js';

// A11y utilities
export { announce, cancelAnnouncements, cleanupLiveRegions, SEARCH_ANNOUNCE_MS, COUNT_ANNOUNCE_MS } from './a11y/live-region.js';
export { getFocusableElements, trapFocus, focusFirst } from './a11y/focus-manager.js';
export { createKeyboardHandler, resolveGroupNavIndex, type KeyBinding } from './a11y/keyboard-handler.js';

// Utilities
export { generateId, resetIdCounter } from './utils/id-generator.js';
export { debounce } from './utils/debounce.js';
export { dispatch, forwardTileClick } from './utils/events.js';
export { interpolate } from './utils/interpolate.js';
export { isRtl } from './utils/direction.js';
export { syncGroupDisabled, stopChildEvent } from './utils/group-utils.js';
export { clickOutside } from './utils/click-outside.js';

// Date utilities
export {
  parseISODate,
  toISODateString,
  formatDate,
  formatDateLong,
  parseDateString,
  isValidDate,
  isSameDay,
  isSameMonth,
  addDays,
  addMonths,
  addYears,
  startOfWeek,
  endOfWeek,
} from './date/date-utils.js';
export {
  generateCalendarMonth,
  getDayOfWeekHeaders,
  getMonthNames,
  type CalendarDay,
  type CalendarMonth,
  type CalendarOptions,
} from './date/calendar.js';
export {
  isDateInRange,
  isDateDisabled,
  clampDate,
  isMonthDisabled,
  type DateConstraints,
} from './date/date-constraints.js';

// Template helpers
export {
  renderLabel,
  renderLegend,
  renderGroupLabel,
  renderHint,
  renderError,
  renderFormHeader,
  inputClasses,
  buildDescribedBy,
  INPUT_WIDTH_CLASSES,
  inputWidthClass,
} from './templates/form-templates.js';
export type { InputWidth, HeadingLevel, LabelSize } from './templates/form-templates.js';

// Form field wrappers
export { CivFormField } from './form-field/civ-form-field.js';
export { CivFormFieldset } from './form-field/civ-form-fieldset.js';

// Preset data
export { resolvePresetOptions } from './data/select-presets.js';
export type { PresetOption, SelectPresetName } from './data/select-presets.js';

// Icon
export { CivIcon } from './icon/civ-icon.js';
export {
  icons,
  registerIcon,
  getIconNames,
  resetIcons,
} from './icon/icon-library.js';
export type { IconDef } from './icon/icon-library.js';

// i18n
export { t, setLocaleStrings, resetLocaleStrings, getLocaleStrings } from './i18n/index.js';
export type { CivLocaleStrings } from './i18n/index.js';

// Mask engine
export {
  MASK_PRESETS,
  applyMask,
  applyDateMask,
  stripMask,
  isComplete,
  getMaxRawLength,
  computeCursorPosition,
  filterInput,
  processRawInput,
} from './mask/index.js';
export type { MaskChar, MaskDefinition } from './mask/index.js';

// Validation
export { validate } from './validation/index.js';
export type { ValidationResult } from './validation/index.js';

// Analytics
export { ANALYTICS_EVENT_NAME } from './analytics/index.js';
export type { AnalyticsEventDetail, AnalyticsAction } from './analytics/index.js';

// Event types
import type { AnalyticsEventDetail } from './analytics/index.js';

/** Detail shape for single-value controls (text-input, select, radio, combobox, date-picker, segmented-control). */
export type CivInputDetail = { value: string };
/** Detail shape for boolean controls (checkbox, toggle). */
export type CivBooleanDetail = { checked: boolean; value: string };
/** Detail shape for multi-value controls (checkbox-group). */
export type CivMultiDetail = { values: string[] };
/** Detail shape for file controls (file-upload). */
export type CivFileDetail = { files: File[] };
/** Detail shape for combobox selection. */
export type CivComboboxDetail = { value: string; label: string };
/** Detail shape for memorable-date. */
export type CivMemorableDateDetail = { value: string; month: string; day: string; year: string };
/** Detail shape for address. */
export type CivAddressDetail = { value: { street1: string; street2: string; city: string; state: string; zip: string } };

export interface CivEventMap {
  'civ-input': CustomEvent<CivInputDetail | CivBooleanDetail | CivMultiDetail | CivFileDetail | CivMemorableDateDetail | CivAddressDetail>;
  'civ-change': CustomEvent<CivInputDetail | CivBooleanDetail | CivMultiDetail | CivFileDetail | CivComboboxDetail | CivMemorableDateDetail | CivAddressDetail>;
  'civ-reset': CustomEvent<void>;
  'civ-dismiss': CustomEvent<void>;
  'civ-submit': CustomEvent<{ formData: FormData }>;
  'civ-invalid': CustomEvent<{ errors: Array<{ name: string; message: string }> }>;
  'civ-analytics': CustomEvent<AnalyticsEventDetail>;
}
