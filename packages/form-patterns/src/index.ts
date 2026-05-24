// Side-effect import ensures the \@customElement decorator on
// CivConfirmationPanel runs even when the package is imported only
// for its named re-exports — without it, consumers using
// `import '@civui/form-patterns'` as a bare side-effect import would
// not get the element registered if the bundler tree-shakes the
// unused name binding. Other form-patterns components have the same
// gap historically; see CLAUDE.md "Cross-Package Component Imports".
import './confirmation-panel/civ-confirmation-panel.js';

// Form
export { CivForm } from './form/index.js';
export type { FormFieldError, CivFormFieldLike } from './form/index.js';

// Form Step
export { CivFormStep } from './form-step/index.js';

// Fieldset
export { CivFieldset } from './fieldset/index.js';

// Conditional
export { CivConditional } from './conditional/index.js';

// Repeater
export { CivRepeater } from './repeater/index.js';

// Summary
export { CivSummary } from './summary/index.js';
export type { SummarySection, SummaryItem } from './summary/index.js';

// Confirmation Panel
export { CivConfirmationPanel } from './confirmation-panel/index.js';

// Data Field
export { CivDataField } from './data-field/index.js';

// Section Intro (trauma-informed context panel)
export { CivSectionIntro } from './section-intro/index.js';

// Support Resources
export { CivSupportResources } from './support-resources/index.js';

// Progress Steps
export { CivProgressSteps, CivProgressPercent, CivProgressHeader } from './progress/index.js';

// Prefill Types
export type { PrefillField, PrefillData, PrefillMeta } from './prefill/index.js';

// Autosave (resume-in-progress)
export { CivFormAutosave } from './autosave/index.js';
export type { AutosaveStorage, AutosaveAdapter, AutosaveSnapshot } from './autosave/index.js';
export { localStorageAdapter, sessionStorageAdapter, toPrefillData } from './autosave/index.js';
