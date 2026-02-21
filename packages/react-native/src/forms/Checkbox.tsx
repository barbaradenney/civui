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

export interface CheckboxProps {
  /** Field name. */
  name: string;
  /** Label text. */
  label: string;
  /** Whether the checkbox is checked. */
  checked?: boolean;
  /** The value submitted with form data. Defaults to "on". */
  value?: string;
  /** Description text below the label. */
  description?: string;
  /** Error message. */
  error?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Display as a tile (bordered card). */
  tile?: boolean;
  /** Called when checked state changes. */
  onChange?: (checked: boolean) => void;
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
});

/**
 * CivDS Checkbox for React Native.
 *
 * Mirrors the civds-checkbox web component API.
 */
export function Checkbox({
  name,
  label,
  checked = false,
  description,
  error,
  required,
  disabled,
  tile,
  onChange,
}: CheckboxProps) {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onChange?.(!checked);
    }
  }, [checked, disabled, onChange]);

  const content = (
    <View style={styles.row}>
      <View
        style={[
          styles.box,
          checked ? styles.boxChecked : null,
          disabled ? styles.boxDisabled : null,
        ]}
      >
        {checked && <Text style={styles.checkmark}>{'\u2713'}</Text>}
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
    <View style={formStyles.container} testID={`civds-checkbox-${name}`}>
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <TouchableOpacity
        style={[
          tile ? styles.tile : null,
          tile && checked ? styles.tileChecked : null,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityLabel={buildAccessibilityLabel({ label, error, required })}
        accessibilityState={{ checked, disabled }}
        testID={`civds-checkbox-${name}-control`}
      >
        {content}
      </TouchableOpacity>
    </View>
  );
}
