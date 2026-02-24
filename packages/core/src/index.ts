// Base classes
export { CivBaseElement } from './base/civ-base-element.js';
export { CivFormElement } from './base/civ-form-element.js';

// A11y utilities
export { announce, cleanupLiveRegions } from './a11y/live-region.js';
export { getFocusableElements, trapFocus, focusFirst } from './a11y/focus-manager.js';
export { createKeyboardHandler, resolveGroupNavIndex, type KeyBinding } from './a11y/keyboard-handler.js';

// Utilities
export { generateId } from './utils/id-generator.js';
export { debounce } from './utils/debounce.js';
export { dispatch } from './utils/events.js';
export { interpolate } from './utils/interpolate.js';
export { isRtl } from './utils/direction.js';

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
  renderHint,
  renderError,
  inputClasses,
} from './templates/form-templates.js';

// Analytics
export { ANALYTICS_EVENT_NAME } from './analytics/index.js';
export type { AnalyticsEventDetail, AnalyticsAction } from './analytics/index.js';
