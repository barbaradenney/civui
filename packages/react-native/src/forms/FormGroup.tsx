import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';

export interface FormGroupProps {
  /** Field name (used for testID). */
  name?: string;
  /** Label text displayed above the group. */
  label?: string;
  /** Hint text displayed below the label. */
  hint?: string;
  /** Error message. */
  error?: string;
  /** Whether the group is required. */
  required?: boolean;
  /** Child form elements. */
  children: ReactNode;
  /** Accessibility hint for screen readers. */
  accessibilityHint?: string;
}

/**
 * CivUI FormGroup for React Native.
 *
 * Simple structural wrapper that renders label, hint, error, and children.
 * Mirrors the civ-form-group web component API.
 */
export function FormGroup({
  name,
  label,
  hint,
  error,
  required,
  children,
  accessibilityHint,
}: FormGroupProps) {
  return (
    <View
      style={formStyles.container}
      accessibilityLabel={label ? buildAccessibilityLabel({ label, hint, error, required }) : undefined}
      accessibilityHint={accessibilityHint}
      testID={name ? `civ-form-group-${name}` : undefined}
    >
      {label ? (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.requiredIndicator}> *</Text>}
        </Text>
      ) : null}
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
