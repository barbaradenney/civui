import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';
import { colors, spacing, typography } from '../core/tokens.js';
import { useAnalytics } from '../core/useAnalytics.js';
import type { AnalyticsHandler } from '../core/useAnalytics.js';
import { Checkbox } from './Checkbox.js';

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** Field name for form data. */
  name: string;
  /** Group legend/label. */
  legend: string;
  /** Currently selected values as comma-separated string. */
  value?: string;
  /** Available checkbox options. */
  options: CheckboxOption[];
  /** Hint text. */
  hint?: string;
  /** Error message. */
  error?: string;
  /** Whether selection is required. */
  required?: boolean;
  /** Whether the entire group is disabled. */
  disabled?: boolean;
  /** Display as tiles (bordered cards). */
  tile?: boolean;
  /** Layout direction. */
  orientation?: 'vertical' | 'horizontal';
  /** Called when selection changes (comma-separated value string). */
  onChange?: (value: string) => void;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string) => void;
  /** Analytics event handler. */
  onAnalytics?: AnalyticsHandler;
}

function parseCommaSeparated(val: string): string[] {
  return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

const styles = StyleSheet.create({
  legend: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[2],
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
});

/**
 * CivUI CheckboxGroup for React Native.
 *
 * Renders a group of checkboxes with multi-select support.
 * Mirrors the civ-checkbox-group web component API.
 */
export function CheckboxGroup({
  name,
  legend,
  value = '',
  options,
  hint,
  error,
  required,
  disabled,
  tile,
  orientation = 'vertical',
  onChange,
  onInput,
  onAnalytics,
}: CheckboxGroupProps) {
  const { trackInteraction } = useAnalytics({ onAnalytics });

  const selected = parseCommaSeparated(value);

  const handleChildChange = useCallback(
    (optionValue: string, checked: boolean) => {
      const current = parseCommaSeparated(value);
      const next = checked
        ? [...current, optionValue]
        : current.filter((v) => v !== optionValue);
      const nextValue = next.join(',');
      onInput?.(nextValue);
      onChange?.(nextValue);
      trackInteraction('CheckboxGroup', 'change', { fieldName: name, label: legend });
    },
    [value, onChange, onInput, trackInteraction, name, legend],
  );

  return (
    <View
      style={formStyles.container}
      accessibilityLabel={buildAccessibilityLabel({ label: legend, hint, error, required })}
      testID={`civ-checkbox-group-${name}`}
    >
      <Text style={styles.legend}>
        {legend}
        {required && <Text style={formStyles.requiredIndicator}> *</Text>}
      </Text>
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <View style={orientation === 'horizontal' ? styles.horizontal : undefined}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            name={`${name}-${option.value}`}
            label={option.label}
            description={option.description}
            checked={selected.includes(option.value)}
            disabled={disabled || option.disabled}
            tile={tile}
            onChange={(checked) => handleChildChange(option.value, checked)}
          />
        ))}
      </View>
    </View>
  );
}
