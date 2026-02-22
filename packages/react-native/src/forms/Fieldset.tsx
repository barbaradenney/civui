import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formStyles } from '../core/styles.js';
import { colors, spacing, typography } from '../core/tokens.js';

export interface FieldsetProps {
  /** Legend text displayed as a heading above the group. */
  legend?: string;
  /** Hint text displayed below the legend. */
  hint?: string;
  /** Error message. */
  error?: string;
  /** Whether the group is required. */
  required?: boolean;
  /** Whether the group is disabled. */
  disabled?: boolean;
  /** Child form elements. */
  children: ReactNode;
}

const styles = StyleSheet.create({
  legend: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[2],
  },
  disabled: {
    opacity: 0.5,
  },
});

/**
 * CivUI Fieldset for React Native.
 *
 * Like FormGroup but with a legend-style heading (larger font).
 * Groups related controls together.
 * Mirrors the civ-fieldset web component API.
 */
export function Fieldset({
  legend,
  hint,
  error,
  required,
  disabled,
  children,
}: FieldsetProps) {
  return (
    <View style={[formStyles.container, disabled ? styles.disabled : null]} pointerEvents={disabled ? 'none' : 'auto'}>
      {legend ? (
        <Text style={styles.legend}>
          {legend}
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
