// Side-effect imports ensure custom elements are registered.
import './button/civ-button.js';
import './action-button/civ-action-button.js';
import './button-group/civ-button-group.js';
import './filter-chip/civ-filter-chip.js';
import './filter-chip-group/civ-filter-chip-group.js';
import './phone-link/civ-phone-link.js';
import './email-link/civ-email-link.js';
import './action-link/civ-action-link.js';

// Button
export { CivButton } from './button/index.js';
export type { ButtonVariant, ButtonType } from './button/index.js';

// Action Button
export { CivActionButton } from './action-button/index.js';
export type { ActionButtonVariant } from './action-button/index.js';

// Button Group
export { CivButtonGroup } from './button-group/index.js';

// Filter Chip
export { CivFilterChip } from './filter-chip/index.js';
export type { FilterChipStyle } from './filter-chip/index.js';

// Filter Chip Group
export { CivFilterChipGroup } from './filter-chip-group/index.js';
export type { FilterChipGroupMode } from './filter-chip-group/index.js';

// Phone Link
export { CivPhoneLink } from './phone-link/index.js';

// Email Link
export { CivEmailLink } from './email-link/index.js';

// Action Link (unified phone/email)
export { CivActionLink } from './action-link/index.js';
export type { ActionLinkType } from './action-link/index.js';
