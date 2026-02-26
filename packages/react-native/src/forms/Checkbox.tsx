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

export interface CheckboxProps {
  /** Field name. */
  name: string;
  /** Label text. */
  label: string;
  /** Whether the checkbox is checked. */
  checked?: boolean;
  /** Tri-state mixed/indeterminate state. */
  indeterminate?: boolean;
  /** The value submitted with form data. Defaults to "on". */
  value?: string;
  /** Description text below the label. */
  description?: string;
  /** Hint text below description. */
  hint?: string;
  /** Error message. */
  error?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Display as a tile (bordered card). */
  tile?: boolean;
  /** Called when checked state changes. */
  onChange?: (checked: boolean, value: string) => void;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (checked: boolean, value: string) => void;
  /** Analytics event handler. */
  onAnalytics?: AnalyticsHandler;
  /** Accessibility hint for screen readers. */
  accessibilityHint?: string;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  box: {
    width: 20,
    height: 20,
    borderWidth: border.width[2],
    borderColor: colors.base.dark,
    borderRadius: border.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  labelText: {
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
    flex: 1,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.base.DEFAULT,
    marginTop: 2,
  },
  tile: {
    borderWidth: border.width[1],
    borderColor: colors.base.lighter,
    borderRadius: border.radius.DEFAULT,
    padding: spacing[3],
  },
  tileChecked: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.lightest,
  },
  boxIndeterminate: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  indeterminateMark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.base.DEFAULT,
    marginTop: 2,
  },
});

/**
 * CivUI Checkbox for React Native.
 *
 * Mirrors the civ-checkbox web component API.
 */
export function Checkbox({
  name,
  label,
  checked = false,
  indeterminate = false,
  value = 'on',
  description,
  hint,
  error,
  required,
  disabled,
  tile,
  onChange,
  onInput,
  onAnalytics,
  accessibilityHint,
}: CheckboxProps) {
  const [focused, setFocused] = useState(false);
  const { trackInteraction } = useAnalytics({ onAnalytics });

  const handlePress = useCallback(() => {
    if (!disabled) {
      const next = !checked;
      onInput?.(next, value);
      onChange?.(next, value);
      trackInteraction('Checkbox', 'change', { fieldName: name, label });
    }
  }, [checked, disabled, onChange, onInput, value, trackInteraction, name, label]);

  const content = (
    <View style={styles.row}>
      <View
        style={[
          styles.box,
          checked ? styles.boxChecked : null,
          indeterminate ? styles.boxIndeterminate : null,
          disabled ? styles.boxDisabled : null,
          !tile && focused ? formStyles.inputFocused : null,
        ]}
      >
        {indeterminate
          ? <Text style={styles.indeterminateMark}>{'\u2014'}</Text>
          : checked
            ? <Text style={styles.checkmark}>{'\u2713'}</Text>
            : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.labelText}>
          {label}
          {required && <Text style={formStyles.requiredIndicator}> *</Text>}
        </Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </View>
  );

  return (
    <View style={formStyles.container} testID={`civ-checkbox-${name}`}>
      <Pressable
        style={({ pressed }) => [
          tile ? styles.tile : null,
          tile && (checked || indeterminate) ? styles.tileChecked : null,
          tile && focused ? formStyles.inputFocused : null,
          pressed ? { opacity: 0.7 } : null,
        ]}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={buildAccessibilityState({ checked: indeterminate ? 'mixed' : checked, disabled })}
        accessibilityHint={accessibilityHint}
        testID={`civ-checkbox-${name}-control`}
      >
        {content}
      </Pressable>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
