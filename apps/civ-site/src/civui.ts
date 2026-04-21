// Import CivUI styles (tokens + Tailwind utilities + component classes)
import '../civui-styles.css';

// Register all CivUI web components
// Import barrel exports — these re-export all components which triggers
// the @customElement decorators to register each custom element
import '@civui/core';
import '@civui/forms';
import '@civui/ui';
import '@civui/navigation';
import '@civui/feedback';

// Force Vite to include form-step (tree-shaking workaround)
import { CivFormStep } from '@civui/forms';
import { CivButton } from '@civui/ui';
import { CivTask } from '@civui/navigation';
import { CivAlert } from '@civui/feedback';
void CivFormStep;
void CivButton;
void CivTask;
void CivAlert;
