// Import CivUI styles (tokens + Tailwind utilities + component classes)
import '../civui-styles.css';

// Register all CivUI web components
// Import barrel exports — these re-export all components which triggers
// the @customElement decorators to register each custom element
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '@civui/form-patterns';
import '@civui/actions';
import '@civui/overlays';
import '@civui/layout';
import '@civui/navigation';
import '@civui/feedback';

// Force Vite to include form-step (tree-shaking workaround)
import { CivFormStep } from '@civui/form-patterns';
import { CivButton } from '@civui/actions';
import { CivTask } from '@civui/navigation';
import { CivAlert } from '@civui/feedback';
void CivFormStep;
void CivButton;
void CivTask;
void CivAlert;
