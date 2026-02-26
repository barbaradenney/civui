import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel, buildAccessibilityState } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';
import { useAnalytics } from '../core/useAnalytics.js';
import type { AnalyticsHandler } from '../core/useAnalytics.js';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Field name for form data. */
  name: string;
  /** Group legend text. */
  legend: string;
  /** @deprecated Use `legend` instead. */
  label?: string;
  /** Currently selected value. */
  value?: string;
  /** Available radio options. */
  options: RadioOption[];
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
  /** Called when selection changes. */
  onChange?: (value: string) => void;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string) => void;
  /** Analytics event handler. */
  onAnalytics?: AnalyticsHandler;
  /** Accessibility hint for screen readers. */
  accessibilityHint?: string;
}

const styles = StyleSheet.create({
  legend: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[2],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  circle: {
    width: 20,
    height: 20,
    borderWidth: border.width[2],
    borderColor: colors.base.dark,
    borderRadius: border.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: spacing[2],
    marginTop: 2,
  },
  circleSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  circleDot: {
    width: 10,
    height: 10,
    borderRadius: border.radius.full,
    backgroundColor: colors.primary.DEFAULT,
  },
  circleDisabled: {
    opacity: 0.5,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
    flex: 1,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.base.DEFAULT,
    marginTop: 2,
  },
  tile: {
    borderWidth: border.width[1],
    borderColor: colors.base.lighter,
    borderRadius: border.radius.DEFAULT,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  tileSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.lightest,
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  flexOne: {
    flex: 1,
  },
});

/**
 * CivUI RadioGroup for React Native.
 *
 * Mirrors the civ-radio-group web component API.
 * Renders a group of radio options with mutual exclusivity.
 */
export function RadioGroup({
  name,
  legend,
  label: deprecatedLabel,
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
  accessibilityHint,
}: RadioGroupProps) {
  const label = legend || deprecatedLabel || '';
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const { trackInteraction } = useAnalytics({ onAnalytics });

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (!disabled) {
        onInput?.(optionValue);
        onChange?.(optionValue);
        trackInteraction('RadioGroup', 'change', { fieldName: name, label });
      }
    },
    [disabled, onChange, onInput, trackInteraction, name, label],
  );

  return (
    <View
      style={formStyles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
      accessibilityHint={accessibilityHint}
      testID={`civ-radio-group-${name}`}
    >
      <Text style={styles.legend}>
        {label}
        {required && <Text style={formStyles.requiredIndicator}> *</Text>}
      </Text>
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <View style={orientation === 'horizontal' ? styles.horizontal : undefined}>
        {options.map((option) => {
          const selected = option.value === value;
          const isDisabled = disabled || option.disabled;

          const content = (
            <View style={styles.optionRow}>
              <View
                style={[
                  styles.circle,
                  selected ? styles.circleSelected : null,
                  isDisabled ? styles.circleDisabled : null,
                ]}
              >
                {selected && <View style={styles.circleDot} />}
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description ? (
                  <Text style={styles.optionDescription}>{option.description}</Text>
                ) : null}
              </View>
            </View>
          );

          const optionFocused = focusedValue === option.value;

          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                tile ? styles.tile : null,
                tile && selected ? styles.tileSelected : null,
                optionFocused ? formStyles.inputFocused : null,
                pressed ? { opacity: 0.7 } : null,
              ]}
              onPress={() => handleSelect(option.value)}
              onFocus={() => setFocusedValue(option.value)}
              onBlur={() => setFocusedValue(null)}
              disabled={isDisabled}
              accessibilityRole="radio"
              accessibilityLabel={buildAccessibilityLabel({ label: option.label, hint: option.description })}
              accessibilityState={buildAccessibilityState({ checked: selected, disabled: isDisabled })}
              testID={`civ-radio-${name}-${option.value}`}
            >
              {content}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
