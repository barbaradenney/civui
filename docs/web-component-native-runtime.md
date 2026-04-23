# Web Component Native Runtime — Reference Document

A reference for building a framework that lets CivUI's Lit web components run natively on iOS and Android — an "Expo for Web Components."

## Problem Statement

CivUI maintains two parallel implementations:

- **Web:** Lit 3 web components (`@civui/inputs`) — 15+ components
- **React Native:** Hand-written RN equivalents (`@civui/react-native`) — 12 components

These share API parity by convention but no rendering code. Every new component or bug fix must be implemented twice. A unified authoring model would eliminate this duplication.

## Current Architecture

### What is shared today

| Asset | Shared? | Mechanism |
|-------|---------|-----------|
| Design tokens (values) | Partially | Web uses `@civui/tokens` CSS vars; RN has inline `tokens.ts` |
| Date utilities | Yes | RN imports `@civui/core/date` |
| Type definitions | Partially | Some shared via `@civui/core`, some duplicated |
| Component logic | No | Fully separate Lit vs React implementations |
| Styling | No | Tailwind CSS vs `StyleSheet.create()` |
| A11y mapping | No | ARIA attributes vs `accessibilityRole`/`accessibilityState` |
| Form participation | No | ElementInternals vs `useForm` hook |
| Event model | No | CustomEvent dispatch vs callback props |
| Analytics payloads | Convention only | Same shape, different emission mechanisms |

### CivUI conventions that enable code generation

CivUI components follow strict patterns that a compiler could exploit:

1. **Render order** is always: label, hint, error, control, supplementary
2. **Props** follow a standard interface: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`
3. **Events** use predictable detail shapes: `{ value }`, `{ values }`, `{ checked, value }`, `{ files }`
4. **Styling** uses semantic Tailwind tokens (`civ-text-error`, `civ-bg-surface`) not arbitrary values
5. **A11y** uses `renderLabel()`, `renderHint()`, `renderError()` helpers from `@civui/core`

---

## Technical Layers Required

### Layer 1: Component Authoring Format

The format in which developers write components. Options:

#### Option A — Lit as source of truth

Keep writing Lit web components. A compiler reads the Lit source and generates native output.

```
civ-text-input.ts (Lit)  ──compiler──▶  TextInput.tsx (React Native)
                          ──compiler──▶  TextInput.swift (SwiftUI, future)
                          ──passthrough──▶  civ-text-input.ts (Web, unchanged)
```

- Pro: No migration; existing components work on web immediately
- Pro: Lit is a W3C-aligned standard; components are usable outside CivUI
- Con: Lit's `html` tagged template literals are harder to statically analyze than JSX
- Con: Imperative patterns (`this.renderRoot.querySelector(...)`) don't translate

#### Option B — Intermediate DSL (Mitosis-style)

Write components in a constrained JSX-like DSL that compiles to both Lit and RN.

```
civ-text-input.civui  ──compiler──▶  civ-text-input.ts (Lit)
                       ──compiler──▶  TextInput.tsx (React Native)
```

- Pro: Clean separation; compiler has full control over output
- Pro: Can enforce CivUI conventions at the language level
- Con: New syntax to learn; existing components must be ported
- Con: Debugging maps through two layers of generated code

#### Option C — Shared logic, platform renderers

Extract component logic into framework-agnostic controllers. Each platform provides a thin rendering shell.

```
text-input.controller.ts (shared logic, state, validation)
  ├── civ-text-input.ts (Lit renderer — calls controller)
  └── TextInput.tsx (RN renderer — calls controller)
```

- Pro: Incrementally adoptable; can start with one component
- Pro: No compiler infrastructure needed
- Con: Still two renderers per component (less duplication, but not zero)
- Con: Controller API design is tricky — must not assume DOM or RN

### Recommendation

**Start with Option C** (shared controllers) for immediate wins, **invest in Option A** (Lit-to-RN compiler) as the long-term goal. Option C reduces duplication today without requiring build tooling. Option A eliminates the second renderer entirely.

---

### Layer 2: Rendering Bridge

Maps the component's template to native views.

#### Lit template → RN JSX mapping

| Lit template construct | React Native equivalent |
|----------------------|------------------------|
| `html\`<div>\`` | `<View>` |
| `html\`<span>\`` | `<Text>` |
| `html\`<input type="text">\`` | `<TextInput>` |
| `html\`<button>\`` | `<Pressable>` / `<TouchableOpacity>` |
| `html\`<select>\`` | `<Modal>` + `<FlatList>` (custom picker) |
| `html\`<label>\`` | `<Text>` with `accessibilityRole` |
| `html\`<fieldset>\`` | `<View>` with `accessibilityRole="radiogroup"` or group |
| `html\`<ul>/<li>\`` | `<FlatList>` or `<View>` |
| `html\`<svg>\`` | `react-native-svg` |
| `@click` / `@input` | `onPress` / `onChangeText` |
| `.value=${x}` | `value={x}` |
| `?disabled=${x}` | `disabled={x}` / `editable={!x}` |
| `class=${classMap({...})}` | `style={[styles.base, condition && styles.variant]}` |
| `${repeat(items, ...)}` | `items.map(...)` or `<FlatList data={items}>` |
| `<slot>` | `{children}` |
| `ifDefined(x)` | Conditional prop spread |

#### Native view primitives needed

A minimal set of native components the bridge must support:

```
View          — layout container (flexbox via Yoga)
Text          — text display
TextInput     — editable text
Pressable     — tap target
ScrollView    — scrollable container
FlatList      — virtualized list
Modal         — overlay/sheet
Switch        — toggle control
Image         — image display
Animated.View — animations
```

#### DOM API shim (for Lit compatibility)

If running Lit directly on native (rather than compiling), a DOM shim is required:

```typescript
// Minimal DOM API surface Lit needs
interface MinimalDOM {
  createElement(tag: string): NativeElement;
  createTextNode(text: string): NativeTextNode;
  createDocumentFragment(): NativeFragment;

  // Custom Elements registry
  customElements: {
    define(name: string, constructor: CustomElementConstructor): void;
    get(name: string): CustomElementConstructor | undefined;
  };

  // Node operations
  appendChild(child: Node): void;
  removeChild(child: Node): void;
  insertBefore(newNode: Node, refNode: Node): void;

  // Attribute operations
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;

  // Event operations
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): boolean;

  // Tree walking
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): NodeList;
}
```

This is a large surface area. Lit's internal usage touches ~60-80 DOM APIs. A full shim is estimated at 3,000-5,000 lines.

---

### Layer 3: Styling Bridge

Maps Tailwind CSS classes to native styles.

#### Token pipeline

The existing `@civui/tokens` build pipeline (`packages/tokens/build/build-tokens.js`) processes W3C DTCG tokens into CSS custom properties. Extend it to also emit:

```
tokens.json (W3C DTCG source)
  ├── css/variables.css        (existing — CSS custom properties)
  ├── css/tailwind.css         (existing — Tailwind theme)
  ├── native/tokens.ts         (new — React Native StyleSheet-compatible values)
  ├── native/tokens.swift      (future — SwiftUI Color/Font definitions)
  └── native/tokens.kt         (future — Compose theme values)
```

The RN package currently has hand-maintained `tokens.ts`. Generating it from the DTCG source ensures parity.

#### Tailwind class → native style mapping

A compile-time transformer that converts Tailwind classes to StyleSheet entries:

```typescript
// Input (from Lit template)
class="civ-p-4 civ-text-error civ-border civ-rounded-md"

// Output (React Native StyleSheet)
{
  padding: tokens.spacing[4],       // 16
  color: tokens.colors.error,       // '#b50909'
  borderWidth: tokens.border.width[1], // 1
  borderColor: tokens.colors.base[300],
  borderRadius: tokens.border.radius.md, // 6
}
```

Mapping table for CivUI's Tailwind utilities:

| Tailwind class pattern | Native style property |
|----------------------|----------------------|
| `civ-p-{n}` | `padding: spacing[n]` |
| `civ-px-{n}` | `paddingHorizontal: spacing[n]` |
| `civ-py-{n}` | `paddingVertical: spacing[n]` |
| `civ-m-{n}` | `margin: spacing[n]` |
| `civ-mt-{n}` | `marginTop: spacing[n]` |
| `civ-text-{color}` | `color: colors[color]` |
| `civ-bg-{color}` | `backgroundColor: colors[color]` |
| `civ-border-{color}` | `borderColor: colors[color]` |
| `civ-border-s-{n}` | `borderLeftWidth` (or `borderRightWidth` in RTL) |
| `civ-rounded-{size}` | `borderRadius: border.radius[size]` |
| `civ-text-{size}` | `fontSize: typography.fontSize[size]` |
| `civ-font-{weight}` | `fontWeight: typography.fontWeight[weight]` |
| `civ-w-full` | `width: '100%'` |
| `civ-flex` | `display: 'flex'` (default in RN) |
| `civ-gap-{n}` | `gap: spacing[n]` |
| `civ-hidden` | `display: 'none'` |
| `civ-sr-only` | off-screen positioning styles |
| `civ-opacity-{n}` | `opacity: n / 100` |
| `focus-visible:civ-focus-ring` | conditional `borderWidth` + `borderColor` + `shadowOffset` on focus |

#### Density system

The web density system uses `[data-civ-scale="dense|spacious"]` CSS selectors. On native:

```typescript
// ThemeProvider accepts scale prop
<CivThemeProvider scale="dense">
  {/* All children receive scaled tokens */}
</CivThemeProvider>

// useTheme() returns scale-adjusted values
const { spacing, typography } = useTheme();
// spacing[4] returns 12 in dense, 16 in default, 20 in spacious
```

#### Dark mode

Web uses `prefers-color-scheme` media query. On native:

```typescript
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme(); // 'light' | 'dark'
// ThemeProvider selects appropriate color tokens
```

---

### Layer 4: Form Participation

Web components use ElementInternals for native form participation. Native has no equivalent.

#### Shared form controller

```typescript
// packages/core/src/form-controller.ts
interface FormController {
  name: string;
  value: string | string[];
  validity: ValidityState;
  required: boolean;
  disabled: boolean;

  // Lifecycle
  connect(form: FormContext): void;
  disconnect(): void;
  reset(initialValue: string): void;

  // Validation
  validate(): boolean;
  setCustomValidity(message: string): void;
  reportValidity(): boolean;
}
```

On web, the controller delegates to ElementInternals. On native, it delegates to the `useForm` context.

#### Validation parity

Both platforms must validate on submit (not blur) and support:

- `required` — field must have a value
- `pattern` — regex validation (text inputs)
- `min` / `max` — range constraints (date, number)
- `minLength` / `maxLength` — length constraints
- Custom validators via `validate` callback
- Error summary with anchor links (web) / scroll-to-field (native)

---

### Layer 5: Accessibility Mapping

#### ARIA → Native mapping table

| ARIA attribute | iOS (UIAccessibility) | Android (AccessibilityNodeInfo) | React Native prop |
|---------------|----------------------|-------------------------------|-------------------|
| `role="button"` | `.button` trait | `className = "Button"` | `accessibilityRole="button"` |
| `role="checkbox"` | `.selected` state toggle | `checkable = true` | `accessibilityRole="checkbox"` |
| `role="radio"` | `.selected` state | `checkable = true, className = "RadioButton"` | `accessibilityRole="radio"` |
| `role="switch"` | `.switchButton` | `className = "Switch"` | `accessibilityRole="switch"` |
| `role="combobox"` | `.adjustable` | `className = "Spinner"` | `accessibilityRole="combobox"` |
| `role="alert"` | Post notification | `AccessibilityEvent.TYPE_ANNOUNCEMENT` | `accessibilityRole="alert"` |
| `role="radiogroup"` | Container grouping | `collectionInfo` | `accessibilityRole="radiogroup"` |
| `aria-label` | `accessibilityLabel` | `contentDescription` | `accessibilityLabel` |
| `aria-describedby` | Combined into label | Combined into contentDescription | Manual label composition |
| `aria-required` | Append "required" to label | `contentDescription += "required"` | `accessibilityValue` or label |
| `aria-invalid` | Append "invalid" to label | `error = true` | `accessibilityState={{ invalid: true }}` |
| `aria-disabled` | `notEnabled` trait | `enabled = false` | `accessibilityState={{ disabled: true }}` |
| `aria-checked` | `.selected` or state | `checked` | `accessibilityState={{ checked }}` |
| `aria-expanded` | Announce state change | `expanded` | `accessibilityState={{ expanded }}` |
| `aria-live="polite"` | Delayed announcement | `TYPE_ANNOUNCEMENT` | `accessibilityLiveRegion="polite"` |
| `aria-live="assertive"` | Immediate announcement | `TYPE_ANNOUNCEMENT` (interrupt) | `accessibilityLiveRegion="assertive"` |

#### Screen reader announcement bridge

Web uses `announce()` from `@civui/core`. Native equivalent:

```typescript
import { AccessibilityInfo, Platform } from 'react-native';

function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  } else {
    // Android: announceForAccessibility available since RN 0.62
    AccessibilityInfo.announceForAccessibility(message);
  }
}
```

---

### Layer 6: Event Model Bridge

#### Web → Native event mapping

| Web event | Native equivalent | Detail shape |
|-----------|------------------|--------------|
| `civ-input` (CustomEvent) | `onInput(value)` callback | `{ value: string }` |
| `civ-change` (CustomEvent) | `onChange(value)` callback | varies by component |
| `civ-analytics` (CustomEvent) | `onAnalytics(event)` callback | `AnalyticsEvent` |
| `@click` | `onPress` | — |
| `@keydown` | `onKeyPress` (limited on RN) | — |
| `@focus` | `onFocus` | — |
| `@blur` | `onBlur` | — |

#### Event detail normalization

A shared event detail type system:

```typescript
// packages/core/src/event-details.ts

type SingleValueDetail = { value: string };
type MultiValueDetail = { values: string[] };
type BooleanDetail = { checked: boolean; value: string };
type FileDetail = { files: File[] };
type ComboboxDetail = { value: string; label: string };
type MemorableDateDetail = { value: string; month: string; day: string; year: string };

type CivEventDetailMap = {
  'civ-text-input': SingleValueDetail;
  'civ-textarea': SingleValueDetail;
  'civ-select': SingleValueDetail;
  'civ-radio-group': SingleValueDetail;
  'civ-segmented-control': SingleValueDetail;
  'civ-date-picker': SingleValueDetail;
  'civ-checkbox': BooleanDetail;
  'civ-toggle': BooleanDetail;
  'civ-checkbox-group': MultiValueDetail;
  'civ-file-upload': FileDetail;
  'civ-combobox': ComboboxDetail;
  'civ-memorable-date': MemorableDateDetail;
};
```

---

## Implementation Approaches Ranked

### Approach 1: Capacitor Shell (WebView)

Run existing web components inside a native WebView wrapper.

**Effort:** 2-4 weeks
**Fidelity:** Exact web behavior
**Native feel:** Low — WebView performance, no native transitions, limited OS integration
**When to use:** Internal tools, rapid prototyping, proof of concept

```
┌─────────────────────────┐
│     Native App Shell    │
│  ┌───────────────────┐  │
│  │     WebView        │  │
│  │  ┌─────────────┐  │  │
│  │  │  Lit + TW    │  │  │
│  │  │  Components  │  │  │
│  │  └─────────────┘  │  │
│  └───────────────────┘  │
│  Native bridge (events) │
└─────────────────────────┘
```

**Steps:**
1. Install Capacitor: `npx cap init`
2. Build web bundle (Storybook or standalone app)
3. Add iOS/Android platforms
4. Bridge native features (camera, filesystem) via Capacitor plugins
5. Test on devices

**Limitations:**
- No native UI widgets (inputs, switches, pickers all rendered in WebView)
- Keyboard handling differs from native
- No native navigation stack
- Performance ceiling for complex forms

---

### Approach 2: Lit → RN Compiler (Recommended Long-Term)

A build tool that reads Lit component source files and generates React Native components.

**Effort:** 2-3 months for core compiler, ongoing maintenance
**Fidelity:** High — generates idiomatic RN code
**Native feel:** High — output is standard React Native

```
┌──────────────────────┐
│  civ-text-input.ts   │  (Lit source — single source of truth)
│  (web component)     │
└──────────┬───────────┘
           │
    ┌──────▼──────┐
    │  Compiler   │
    │  Pipeline   │
    └──────┬──────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  Web (as-is)  TextInput.tsx (generated RN)
```

#### Compiler pipeline stages

```
Stage 1: Parse
  └─ TypeScript compiler API reads .ts file
  └─ Extract: class name, properties (@property), render() template, event handlers

Stage 2: Analyze
  └─ Map Lit reactive properties to React props interface
  └─ Map html`` template to JSX AST
  └─ Map CSS classes to StyleSheet entries
  └─ Map event listeners to callback props
  └─ Map ARIA attributes to RN accessibility props

Stage 3: Generate
  └─ Emit React functional component with hooks
  └─ Emit TypeScript props interface
  └─ Emit StyleSheet.create() block
  └─ Emit barrel export

Stage 4: Post-process
  └─ Run Prettier
  └─ Run TypeScript type-check
  └─ Generate diff report (what changed since last generation)
```

#### What the compiler handles vs what needs manual overrides

**Automatable (covers ~80% of component code):**
- Property → prop mapping
- Simple template → JSX conversion (div, span, input, button, label)
- Tailwind class → StyleSheet conversion
- ARIA attribute → accessibilityRole/State mapping
- Event dispatch → callback prop
- Conditional rendering (`${this.error ? html`...` : nothing}`)
- Repeat/map directives
- Slot → children

**Requires manual overrides / escape hatches:**
- `<select>` → Modal picker (fundamental UX difference)
- `<input type="file">` → `react-native-document-picker`
- Calendar rendering (touch gestures, swipe navigation)
- Keyboard handling differences
- Platform-specific animations
- Native module integrations

#### Override mechanism

```typescript
// compiler.config.ts
export default {
  components: {
    'civ-select': {
      // Use hand-written RN component instead of generating
      override: './overrides/Select.tsx',
    },
    'civ-date-picker': {
      override: './overrides/DatePicker.tsx',
    },
    'civ-text-input': {
      // Generate, but patch specific methods
      patches: {
        renderControl: './patches/text-input-control.tsx',
      },
    },
  },
};
```

#### Compiler technology options

| Tool | Purpose | Why |
|------|---------|-----|
| **TypeScript Compiler API** | Parse Lit source | Already in the toolchain; full type info |
| **ts-morph** | Simplified TS AST manipulation | Easier API than raw `ts.createProgram` |
| **lit-analyzer** | Lit-specific AST | Understands `html`, `css`, `@property` |
| **recast** | Generate JSX output | Preserves formatting, produces clean code |
| **Prettier** | Format output | Consistent code style |

---

### Approach 3: Shared Controllers + Platform Renderers (Recommended Near-Term)

Extract business logic into framework-agnostic controllers. Each platform provides a thin rendering layer.

**Effort:** 1-2 months for extraction, then incremental
**Fidelity:** High — logic shared, rendering platform-native
**Native feel:** High — each renderer is idiomatic

```
┌─────────────────────────────────────┐
│         Shared Controller           │
│  (state, validation, a11y, events)  │
└──────────┬──────────────────┬───────┘
           │                  │
     ┌─────▼─────┐    ┌──────▼──────┐
     │ Lit Shell  │    │  RN Shell   │
     │ (template) │    │ (JSX + RN)  │
     └───────────┘    └─────────────┘
```

#### Example: TextInput controller

```typescript
// packages/core/src/controllers/text-input.controller.ts

export interface TextInputState {
  value: string;
  isFocused: boolean;
  isDirty: boolean;
  charCount: number;
  hasError: boolean;
  errorMessage: string;
}

export interface TextInputConfig {
  name: string;
  label: string;
  initialValue?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  requiredMessage?: string;
  patternMessage?: string;
  onChange?: (value: string) => void;
  onInput?: (value: string) => void;
}

export class TextInputController {
  private state: TextInputState;
  private config: TextInputConfig;
  private subscribers: Set<(state: TextInputState) => void> = new Set();

  constructor(config: TextInputConfig) {
    this.config = config;
    this.state = {
      value: config.initialValue ?? '',
      isFocused: false,
      isDirty: false,
      charCount: (config.initialValue ?? '').length,
      hasError: false,
      errorMessage: '',
    };
  }

  // Called by platform renderer on user input
  handleInput(value: string): void {
    this.state = {
      ...this.state,
      value,
      isDirty: true,
      charCount: value.length,
    };
    this.config.onInput?.(value);
    this.notify();
  }

  // Called by platform renderer on blur / commit
  handleChange(): void {
    this.config.onChange?.(this.state.value);
  }

  handleFocus(): void {
    this.state = { ...this.state, isFocused: true };
    this.notify();
  }

  handleBlur(): void {
    this.state = { ...this.state, isFocused: false };
    this.handleChange();
    this.notify();
  }

  validate(): boolean {
    const { value } = this.state;
    const { required, maxLength, pattern, requiredMessage, patternMessage } = this.config;

    if (required && !value.trim()) {
      this.setError(requiredMessage ?? 'This field is required');
      return false;
    }
    if (maxLength && value.length > maxLength) {
      this.setError(`Must be ${maxLength} characters or fewer`);
      return false;
    }
    if (pattern && !pattern.test(value)) {
      this.setError(patternMessage ?? 'Invalid format');
      return false;
    }

    this.clearError();
    return true;
  }

  setError(message: string): void {
    this.state = { ...this.state, hasError: true, errorMessage: message };
    this.notify();
  }

  clearError(): void {
    this.state = { ...this.state, hasError: false, errorMessage: '' };
    this.notify();
  }

  reset(): void {
    this.state = {
      value: this.config.initialValue ?? '',
      isFocused: false,
      isDirty: false,
      charCount: (this.config.initialValue ?? '').length,
      hasError: false,
      errorMessage: '',
    };
    this.notify();
  }

  getState(): TextInputState {
    return { ...this.state };
  }

  subscribe(fn: (state: TextInputState) => void): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  private notify(): void {
    const snapshot = this.getState();
    this.subscribers.forEach(fn => fn(snapshot));
  }
}
```

#### Lit renderer (thin shell)

```typescript
// packages/forms/src/text-input/civ-text-input.ts (simplified)

@customElement('civ-text-input')
export class CivTextInput extends CivFormElement {
  private ctrl = new TextInputController({ /* config from props */ });

  connectedCallback() {
    super.connectedCallback();
    this.ctrl.subscribe(state => this.requestUpdate());
  }

  render() {
    const state = this.ctrl.getState();
    return html`
      ${renderLabel(this.label, this.fieldId, this.required)}
      ${renderHint(this.hint, this.hintId)}
      ${renderError(state.errorMessage, this.errorId)}
      <input
        class="civ-input ${state.hasError ? 'civ-input-error' : ''}"
        .value=${state.value}
        @input=${(e) => this.ctrl.handleInput(e.target.value)}
        @blur=${() => this.ctrl.handleBlur()}
      />
    `;
  }
}
```

#### RN renderer (thin shell)

```typescript
// packages/react-native/src/forms/TextInput.tsx (simplified)

export function CivTextInput(props: TextInputProps) {
  const ctrl = useRef(new TextInputController({ /* config from props */ }));
  const [state, setState] = useState(ctrl.current.getState());

  useEffect(() => ctrl.current.subscribe(setState), []);

  return (
    <View>
      <Label text={props.label} required={props.required} />
      <Hint text={props.hint} />
      <ErrorMessage text={state.errorMessage} />
      <RNTextInput
        value={state.value}
        onChangeText={(v) => ctrl.current.handleInput(v)}
        onBlur={() => ctrl.current.handleBlur()}
        style={[formStyles.input, state.hasError && formStyles.inputError]}
      />
    </View>
  );
}
```

---

### Approach 4: Native DOM Engine (Long-Term / Community Effort)

Implement a minimal DOM + Custom Elements runtime on top of a native rendering engine.

**Effort:** 6-12+ months, dedicated team
**Fidelity:** Near-perfect — Lit runs unmodified
**Native feel:** Depends on view mapping quality

```
┌─────────────────────────────────────┐
│  JavaScript Engine (Hermes / JSC)   │
│  ┌───────────────────────────────┐  │
│  │  DOM Shim (~80 APIs)          │  │
│  │  Custom Elements Registry     │  │
│  │  Lit Runtime                  │  │
│  │  CivUI Components (unmodified)│  │
│  └──────────────┬────────────────┘  │
│                 │ Bridge (JSI)       │
│  ┌──────────────▼────────────────┐  │
│  │  Native View Manager          │  │
│  │  (maps DOM nodes to UIKit /   │  │
│  │   Android Views)              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Prior art and related projects

| Project | Status | Approach | Relevance |
|---------|--------|----------|-----------|
| **Capacitor** (Ionic) | Active, mature | WebView wrapper | Lowest effort, not truly native |
| **Mitosis** (Builder.io) | Active | Compile JSX DSL to multiple frameworks | Could compile to Lit + RN |
| **Stencil** (Ionic) | Active | WC compiler with JSX | Generates web components; no native output |
| **NativeScript** | Active | JS → native bridge with DOM-like API | Closest to a native DOM engine |
| **Lynx** (ByteDance) | Active (2025) | Web-like syntax → native rendering | Multi-platform, open-sourced recently |
| **Domino** | Active | Server-side DOM implementation in JS | Could be adapted for native |
| **basicHTML** | Active | Lightweight DOM in JS | Minimal; good starting point for shim |
| **undom** | Stale | Minimal DOM in 1KB | Too minimal for Lit but good reference |
| **preact-native** (concept) | Concept only | Preact rendering to native views | Demonstrates renderer adapter pattern |

#### DOM APIs that Lit requires

Audited from Lit 3.x source. These are the DOM APIs that must be shimmed:

**Critical (blocks rendering):**
- `document.createElement` / `createTextNode` / `createDocumentFragment`
- `document.createTreeWalker` (Lit's template instantiation)
- `document.importNode` (template cloning)
- `Node.appendChild` / `removeChild` / `insertBefore` / `replaceChild`
- `Element.setAttribute` / `getAttribute` / `removeAttribute` / `hasAttribute`
- `Element.classList` (add, remove, toggle, contains)
- `Element.innerHTML` (for template parsing)
- `HTMLTemplateElement.content`
- `CustomElementRegistry.define` / `get` / `whenDefined`
- `MutationObserver` (Lit's `ReactiveElement` uses it)
- `CSSStyleSheet` / `adoptedStyleSheets` (can be no-op for Light DOM)

**Important (used by components):**
- `EventTarget.addEventListener` / `removeEventListener` / `dispatchEvent`
- `CustomEvent` constructor
- `Element.querySelector` / `querySelectorAll`
- `Element.closest`
- `Element.matches`
- `Node.parentNode` / `childNodes` / `nextSibling` / `previousSibling`
- `Element.id` / `tagName` / `textContent`
- `HTMLInputElement.value` / `checked` / `disabled`
- `HTMLElement.focus` / `blur`
- `window.requestAnimationFrame`
- `window.getComputedStyle` (can return token-based values)
- `window.matchMedia` (for dark mode / responsive)

**Nice to have (progressive enhancement):**
- `IntersectionObserver` (lazy loading)
- `ResizeObserver` (responsive components)
- `Element.animate` (Web Animations API)
- `navigator.clipboard`

---

## Milestone Plan

### Phase 1: Foundation (Months 1-2)

- [ ] Generate `tokens.ts` from DTCG source (eliminate hand-maintained RN tokens)
- [ ] Extract shared event detail types to `@civui/core`
- [ ] Extract shared validation logic to `@civui/core`
- [ ] Build `TextInputController` as proof of concept
- [ ] Wire controller into both Lit and RN renderers for `civ-text-input`
- [ ] Measure code reduction and validate approach

### Phase 2: Controller Extraction (Months 2-4)

- [ ] Extract controllers for all 12 existing RN components
- [ ] Build shared a11y mapping utilities
- [ ] Shared analytics event builder
- [ ] Shared form state manager (generalize `useForm`)
- [ ] Test suite for controllers (platform-agnostic)

### Phase 3: Compiler Prototype (Months 4-6)

- [ ] Build Lit source parser (TypeScript Compiler API + lit-analyzer)
- [ ] Template → JSX transformer for simple components
- [ ] Tailwind class → StyleSheet transformer
- [ ] ARIA → accessibilityRole mapper
- [ ] Event dispatch → callback mapper
- [ ] Generate `TextInput.tsx` from `civ-text-input.ts` successfully
- [ ] Compare generated output with hand-written version

### Phase 4: Compiler Production (Months 6-9)

- [ ] Handle all 15+ web components
- [ ] Override mechanism for complex components (Select, DatePicker)
- [ ] Patch mechanism for partial overrides
- [ ] CI integration (generate on build, diff check)
- [ ] Delete hand-written RN components, switch to generated
- [ ] Documentation and contributor guide

### Phase 5: Expansion (Months 9-12+)

- [ ] Evaluate adding SwiftUI output target
- [ ] Evaluate adding Jetpack Compose output target
- [ ] Evaluate Lynx integration
- [ ] Community feedback and API stabilization

---

## Open Questions

1. **Should the compiler output be checked into git or generated on build?**
   Checked-in is easier to review and debug. Generated-on-build is cleaner but harder to audit.

2. **How do we handle RN components that have no web equivalent?**
   (e.g., bottom sheets, swipe actions, haptic feedback). Need an escape hatch for native-only components.

3. **Should we adopt Mitosis instead of building our own compiler?**
   Mitosis is general-purpose. A CivUI-specific compiler can exploit our strict conventions for better output. But Mitosis has community momentum.

4. **What's the testing strategy for generated code?**
   Run the same behavioral test suite against both web and RN? Or test the compiler's output separately?

5. **Is NativeScript's DOM implementation reusable?**
   NativeScript implements a substantial DOM shim. Forking/adapting it could save months on Approach 4.

6. **Should we target Expo specifically or bare React Native?**
   Expo has better DX but constrains native module usage. Generated components should work with both.

---

## Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lit template parsing is fragile | Compiler breaks on complex templates | Robust test suite; override escape hatch |
| RN version churn | Generated code breaks on RN upgrades | Pin RN version; CI matrix testing |
| A11y parity gaps | Screen reader behavior differs across platforms | Manual testing on VoiceOver + TalkBack per release |
| Performance regression | Generated code less optimized than hand-written | Benchmark suite; allow hand-written overrides |
| Scope creep | "Expo for WC" becomes an OS project | Strict phased milestones; cut scope at each phase gate |

---

## References

- [Lit documentation — Reactive controllers](https://lit.dev/docs/composition/controllers/)
- [Mitosis — Write components once, run everywhere](https://github.com/BuilderIO/mitosis)
- [Capacitor — Cross-platform native runtime for web apps](https://capacitorjs.com/)
- [NativeScript — DOM implementation](https://github.com/nicolo-ribaudo/nativescript-dom)
- [Lynx — ByteDance's cross-platform framework](https://lynxjs.org/)
- [Stencil — Web component compiler](https://stenciljs.com/)
- [undom — Minimal DOM in JS](https://github.com/nicolo-ribaudo/undom)
- [W3C Custom Elements spec](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [React Native New Architecture (Fabric + JSI)](https://reactnative.dev/docs/new-architecture-intro)
