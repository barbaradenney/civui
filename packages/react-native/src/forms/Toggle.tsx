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

export interface ToggleProps {
  /** Field name. */
  name: string;
  /** Label text. */
  label: string;
  /** Whether the toggle is on. */
  checked?: boolean;
  /** Secondary text below the label. */
  description?: string;
  /** Hint text. */
  hint?: string;
  /** Error message. */
  error?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Called when checked state changes. */
  onChange?: (checked: boolean) => void;
}

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 22;
const THUMB_SIZE = 18;
const THUMB_OFFSET = 2;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: border.width[1],
    justifyContent: 'center',
    padding: THUMB_OFFSET,
  },
  trackOff: {
    backgroundColor: colors.base.light,
    borderColor: colors.base.DEFAULT,
  },
  trackOn: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  labelText: {
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.base.DEFAULT,
    marginTop: 2,
  },
});

/**
 * CivUI Toggle Switch for React Native.
 *
 * Mirrors the civ-toggle web component API.
 */
export function Toggle({
  name,
  label,
  checked = false,
  description,
  hint,
  error,
  required,
  disabled,
  onChange,
}: ToggleProps) {
  const [focused, setFocused] = useState(false);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onChange?.(!checked);
    }
  }, [checked, disabled, onChange]);

  return (
    <View style={formStyles.container} testID={`civ-toggle-${name}`}>
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}
      <TouchableOpacity
        style={styles.row}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={{ checked, disabled }}
        testID={`civ-toggle-${name}-control`}
      >
        <View
          style={[
            styles.track,
            checked ? styles.trackOn : styles.trackOff,
            disabled ? styles.trackDisabled : null,
            focused ? formStyles.inputFocused : null,
          ]}
        >
          <View style={[styles.thumb, checked ? styles.thumbOn : styles.thumbOff]} />
        </View>
        <View>
          <Text style={styles.labelText}>
            {label}
            {required && <Text style={formStyles.requiredIndicator}> *</Text>}
          </Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}
