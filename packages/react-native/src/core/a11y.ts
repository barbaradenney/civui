import type { AccessibilityRole, AccessibilityState } from 'react-native';

/**
 * Map common ARIA roles to React Native accessibilityRole.
 */
export function mapAriaRole(role: string): AccessibilityRole | undefined {
  const roleMap: Record<string, AccessibilityRole> = {
    alert: 'alert',
    button: 'button',
    checkbox: 'checkbox',
    combobox: 'combobox',
    heading: 'header',
    img: 'image',
    link: 'link',
    list: 'list',
    listitem: 'none', // RN doesn't have listitem
    menu: 'menu',
    menuitem: 'menuitem',
    none: 'none',
    progressbar: 'progressbar',
    radio: 'radio',
    radiogroup: 'radiogroup',
    search: 'search',
    spinbutton: 'spinbutton',
    switch: 'switch',
    tab: 'tab',
    tablist: 'tablist',
    text: 'text',
    timer: 'timer',
  };
  return roleMap[role];
}

/**
 * Build React Native AccessibilityState from common form props.
 */
export function buildAccessibilityState(props: {
  disabled?: boolean;
  checked?: boolean;
  selected?: boolean;
  busy?: boolean;
  expanded?: boolean;
}): AccessibilityState {
  const state: AccessibilityState = {};
  if (props.disabled !== undefined) state.disabled = props.disabled;
  if (props.checked !== undefined) state.checked = props.checked;
  if (props.selected !== undefined) state.selected = props.selected;
  if (props.busy !== undefined) state.busy = props.busy;
  if (props.expanded !== undefined) state.expanded = props.expanded;
  return state;
}

/**
 * Build an accessible label string combining label, hint, and error.
 */
export function buildAccessibilityLabel(parts: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}): string {
  const segments: string[] = [];
  if (parts.label) {
    segments.push(parts.required ? `${parts.label}, required` : parts.label);
  }
  if (parts.hint) segments.push(parts.hint);
  if (parts.error) segments.push(`Error: ${parts.error}`);
  return segments.join('. ');
}
