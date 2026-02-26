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

export interface SegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Field name for form data. */
  name: string;
  /** Group legend text. */
  legend: string;
  /** @deprecated Use `legend` instead. */
  label?: string;
  /** Currently selected value. */
  value?: string;
  /** Available segment options. */
  options: SegmentOption[];
  /** Hint text. */
  hint?: string;
  /** Error message. */
  error?: string;
  /** Whether selection is required. */
  required?: boolean;
  /** Whether the entire control is disabled. */
  disabled?: boolean;
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
  segmentRow: {
    flexDirection: 'row',
  },
  segment: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: border.width[1],
    borderColor: colors.base.lighter,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  segmentDisabled: {
    opacity: 0.5,
  },
  segmentFirst: {
    borderTopStartRadius: border.radius.DEFAULT,
    borderBottomStartRadius: border.radius.DEFAULT,
  },
  segmentLast: {
    borderTopEndRadius: border.radius.DEFAULT,
    borderBottomEndRadius: border.radius.DEFAULT,
  },
  segmentMiddle: {
    borderStartWidth: 0,
  },
  segmentLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.base.darkest,
  },
  segmentLabelSelected: {
    color: colors.white,
  },
  legend: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[2],
  },
});

/**
 * CivUI SegmentedControl for React Native.
 *
 * Mirrors the civ-segmented-control web component API.
 * Renders a group of mutually exclusive segment options.
 */
export function SegmentedControl({
  name,
  legend,
  label: deprecatedLabel,
  value = '',
  options,
  hint,
  error,
  required,
  disabled,
  onChange,
  onInput,
  onAnalytics,
  accessibilityHint,
}: SegmentedControlProps) {
  const label = legend || deprecatedLabel || '';
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const { trackInteraction } = useAnalytics({ onAnalytics });

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (!disabled) {
        onInput?.(optionValue);
        onChange?.(optionValue);
        trackInteraction('SegmentedControl', 'change', { fieldName: name, label });
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
      testID={`civ-segmented-control-${name}`}
    >
      {label ? (
        <Text style={styles.legend}>
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

      <View style={styles.segmentRow}>
        {options.map((option, index) => {
          const selected = option.value === value;
          const isDisabled = disabled || option.disabled;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;
          const isMiddle = !isFirst && !isLast;
          const optionFocused = focusedValue === option.value;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.segment,
                selected ? styles.segmentSelected : null,
                isDisabled ? styles.segmentDisabled : null,
                isFirst ? styles.segmentFirst : null,
                isLast ? styles.segmentLast : null,
                isMiddle || isLast ? styles.segmentMiddle : null,
                optionFocused ? formStyles.inputFocused : null,
              ]}
              onPress={() => handleSelect(option.value)}
              onFocus={() => setFocusedValue(option.value)}
              onBlur={() => setFocusedValue(null)}
              disabled={isDisabled}
              accessibilityRole="radio"
              accessibilityLabel={buildAccessibilityLabel({ label: option.label })}
              accessibilityState={buildAccessibilityState({ checked: selected, disabled: isDisabled })}
              testID={`civ-segment-${name}-${option.value}`}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  selected ? styles.segmentLabelSelected : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
