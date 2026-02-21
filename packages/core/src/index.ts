// Base classes
export { CivdsBaseElement } from './base/civds-base-element.js';
export { CivdsFormElement } from './base/civds-form-element.js';

// A11y utilities
export { announce } from './a11y/live-region.js';
export { getFocusableElements, trapFocus, focusFirst } from './a11y/focus-manager.js';
export { createKeyboardHandler, type KeyBinding } from './a11y/keyboard-handler.js';

// Utilities
export { generateId } from './utils/id-generator.js';
export { debounce } from './utils/debounce.js';
export { dispatch } from './utils/events.js';

// Analytics
export { ANALYTICS_EVENT_NAME } from './analytics/index.js';
export type { AnalyticsEventDetail, AnalyticsAction } from './analytics/index.js';
