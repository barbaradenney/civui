// Side-effect imports ensure custom elements are registered.
import './alert/civ-alert.js';
import './badge/civ-badge.js';

// Alert
export { CivAlert } from './alert/index.js';
export type { AlertVariant, AlertStyle, AlertHeadingLevel } from './alert/index.js';

// Badge
export { CivBadge } from './badge/index.js';
export type { BadgeVariant, BadgeStyle } from './badge/index.js';
