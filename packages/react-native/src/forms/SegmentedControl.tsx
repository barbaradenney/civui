import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';

export interface SegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Field name for form data. */
  name: string;
  /** Accessible group label. */
  label: string;
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
    borderTopLeftRadius: border.radius.DEFAULT,
    borderBottomLeftRadius: border.radius.DEFAULT,
  },
  segmentLast: {
    borderTopRightRadius: border.radius.DEFAULT,
    borderBottomRightRadius: border.radius.DEFAULT,
  },
  segmentMiddle: {
    borderLeftWidth: 0,
  },
  segmentLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.base.darkest,
  },
  segmentLabelSelected: {
    color: colors.white,
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
  label,
  value = '',
  options,
  hint,
  error,
  required,
  disabled,
  onChange,
}: SegmentedControlProps) {
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (!disabled) {
        onChange?.(optionValue);
      }
    },
    [disabled, onChange],
  );

  return (
    <View
      style={formStyles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
      testID={`civ-segmented-control-${name}`}
    >
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
            <TouchableOpacity
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
              accessibilityLabel={option.label}
              accessibilityState={{ selected, disabled: isDisabled }}
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
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
