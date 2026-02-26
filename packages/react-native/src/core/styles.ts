import { StyleSheet } from 'react-native';
import { colors, spacing, typography, border } from './tokens.js';

/**
 * Shared styles used across all CivUI form components.
 * Keeps visual consistency without duplicating StyleSheet.create calls.
 */
export const formStyles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[1],
  },
  requiredIndicator: {
    color: colors.error.DEFAULT,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.base.DEFAULT,
    marginBottom: spacing[1],
  },
  error: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.error.DEFAULT,
    marginBottom: spacing[1],
  },
  input: {
    borderWidth: border.width[1],
    borderColor: colors.base.light,
    borderRadius: border.radius.DEFAULT,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error.DEFAULT,
    borderStartWidth: border.width[4],
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: colors.base.lightest,
  },
  inputFocused: {
    borderColor: colors.primary.DEFAULT,
    borderWidth: 3,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
});
