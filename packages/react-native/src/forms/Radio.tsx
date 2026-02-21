import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Field name for form data. */
  name: string;
  /** Group legend/label. */
  label: string;
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
  /** Called when selection changes. */
  onChange?: (value: string) => void;
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
    marginRight: spacing[2],
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
});

/**
 * CivDS RadioGroup for React Native.
 *
 * Mirrors the civds-radio-group web component API.
 * Renders a group of radio options with mutual exclusivity.
 */
export function RadioGroup({
  name,
  label,
  value = '',
  options,
  hint,
  error,
  required,
  disabled,
  tile,
  onChange,
}: RadioGroupProps) {
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
      testID={`civds-radio-group-${name}`}
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
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              {option.description ? (
                <Text style={styles.optionDescription}>{option.description}</Text>
              ) : null}
            </View>
          </View>
        );

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              tile ? styles.tile : null,
              tile && selected ? styles.tileSelected : null,
            ]}
            onPress={() => handleSelect(option.value)}
            disabled={isDisabled}
            accessibilityRole="radio"
            accessibilityLabel={buildAccessibilityLabel({ label: option.label })}
            accessibilityState={{ selected, disabled: isDisabled }}
            testID={`civds-radio-${name}-${option.value}`}
          >
            {content}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
