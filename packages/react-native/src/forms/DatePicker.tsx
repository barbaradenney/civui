import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';
import type { CivdsFormProps } from '../core/types.js';
import {
  parseISODate,
  toISODateString,
  formatDate,
  formatDateLong,
  generateCalendarMonth,
  getDayOfWeekHeaders,
  getMonthNames,
  isSameDay,
  isDateDisabled,
  isMonthDisabled,
  type DateConstraints,
} from '@civds/core/date';

export interface DatePickerProps extends CivdsFormProps {
  /** Minimum selectable date in YYYY-MM-DD format. */
  min?: string;
  /** Maximum selectable date in YYYY-MM-DD format. */
  max?: string;
  /** Locale for date formatting (default: en-US). */
  locale?: string;
  /** Day the week starts on (0=Sunday, 1=Monday). */
  weekStartsOn?: number;
  /** Custom function to disable specific dates. */
  isDateDisabled?: (date: Date) => boolean;
  /** Placeholder text for the trigger. */
  placeholder?: string;
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
    flex: 1,
  },
  placeholderText: {
    color: colors.base.light,
  },
  calendarIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.base.DEFAULT,
    marginLeft: spacing[2],
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing[4],
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: border.radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: border.width[1],
    borderBottomColor: colors.base.lighter,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  navButton: {
    padding: spacing[2],
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.bold,
  },
  monthYearText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
  },
  grid: {
    padding: spacing[2],
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayHeader: {
    width: 40,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.base.dark,
    paddingVertical: spacing[1],
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: border.radius.full,
  },
  dayCellText: {
    fontSize: typography.fontSize.sm,
    color: colors.base.darkest,
  },
  dayOutOfMonth: {
    opacity: 0.3,
  },
  dayDisabled: {
    opacity: 0.3,
  },
  daySelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  daySelectedText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  dayToday: {
    borderWidth: border.width[2],
    borderColor: colors.primary.DEFAULT,
  },
  doneButton: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
});

/**
 * CivDS Date Picker for React Native.
 *
 * Renders a trigger button that opens a modal calendar grid.
 * Mirrors the civds-date-picker web component API.
 */
export function DatePicker({
  name,
  value = '',
  label,
  hint,
  error,
  required,
  disabled,
  min,
  max,
  locale = 'en-US',
  weekStartsOn = 0,
  isDateDisabled: customIsDisabled,
  placeholder = 'Select a date',
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() => {
    const parsed = value ? parseISODate(value) : null;
    return parsed ? parsed.getMonth() : new Date().getMonth();
  });
  const [displayYear, setDisplayYear] = useState(() => {
    const parsed = value ? parseISODate(value) : null;
    return parsed ? parsed.getFullYear() : new Date().getFullYear();
  });

  const constraints: DateConstraints = useMemo(
    () => ({ min, max, isDateDisabled: customIsDisabled }),
    [min, max, customIsDisabled],
  );

  const selectedDate = useMemo(
    () => (value ? parseISODate(value) : null),
    [value],
  );

  const displayText = selectedDate
    ? formatDate(selectedDate, locale)
    : '';

  const cal = useMemo(
    () => generateCalendarMonth(displayYear, displayMonth, { weekStartsOn }),
    [displayYear, displayMonth, weekStartsOn],
  );

  const headers = useMemo(
    () => getDayOfWeekHeaders(locale, weekStartsOn),
    [locale, weekStartsOn],
  );

  const monthNames = useMemo(() => getMonthNames(locale), [locale]);

  const handleSelect = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, constraints)) return;
      onChange?.(toISODateString(date));
      setOpen(false);
    },
    [onChange, constraints],
  );

  const prevMonth = useCallback(() => {
    setDisplayMonth((m) => {
      if (m === 0) {
        setDisplayYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setDisplayMonth((m) => {
      if (m === 11) {
        setDisplayYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const prevDisabled = isMonthDisabled(
    displayMonth === 0 ? displayYear - 1 : displayYear,
    displayMonth === 0 ? 11 : displayMonth - 1,
    constraints,
  );

  const nextDisabled = isMonthDisabled(
    displayMonth === 11 ? displayYear + 1 : displayYear,
    displayMonth === 11 ? 0 : displayMonth + 1,
    constraints,
  );

  const handleOpen = useCallback(() => {
    if (disabled) return;
    if (selectedDate) {
      setDisplayMonth(selectedDate.getMonth());
      setDisplayYear(selectedDate.getFullYear());
    }
    setOpen(true);
  }, [disabled, selectedDate]);

  return (
    <View style={formStyles.container} testID={`civds-date-picker-${name}`}>
      <Text style={formStyles.label}>
        {label}
        {required && <Text style={formStyles.requiredIndicator}> *</Text>}
      </Text>
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[
          formStyles.input,
          styles.trigger,
          error ? formStyles.inputError : null,
          disabled ? formStyles.inputDisabled : null,
        ]}
        onPress={handleOpen}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={{ disabled }}
        testID={`civds-date-picker-${name}-trigger`}
      >
        <Text
          style={[styles.triggerText, !selectedDate ? styles.placeholderText : null]}
        >
          {selectedDate ? displayText : placeholder}
        </Text>
        <Text style={styles.calendarIcon}>{'\uD83D\uDCC5'}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.navButton, prevDisabled ? styles.navButtonDisabled : null]}
                onPress={prevMonth}
                disabled={prevDisabled}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <Text style={styles.navButtonText}>{'\u25C0'}</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {monthNames[displayMonth]} {displayYear}
              </Text>
              <TouchableOpacity
                style={[styles.navButton, nextDisabled ? styles.navButtonDisabled : null]}
                onPress={nextMonth}
                disabled={nextDisabled}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <Text style={styles.navButtonText}>{'\u25B6'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              <View style={styles.weekRow}>
                {headers.map((h) => (
                  <Text key={h.short} style={styles.dayHeader}>
                    {h.short}
                  </Text>
                ))}
              </View>
              {cal.weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  {week.map((day) => {
                    const dayDisabled =
                      !day.inCurrentMonth || isDateDisabled(day.date, constraints);
                    const selected = selectedDate
                      ? isSameDay(day.date, selectedDate)
                      : false;

                    return (
                      <TouchableOpacity
                        key={toISODateString(day.date)}
                        style={[
                          styles.dayCell,
                          !day.inCurrentMonth ? styles.dayOutOfMonth : null,
                          dayDisabled ? styles.dayDisabled : null,
                          selected ? styles.daySelected : null,
                          day.isToday && !selected ? styles.dayToday : null,
                        ]}
                        onPress={() => handleSelect(day.date)}
                        disabled={dayDisabled}
                        accessibilityRole="button"
                        accessibilityLabel={formatDateLong(day.date, locale)}
                        accessibilityState={{
                          selected,
                          disabled: dayDisabled,
                        }}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            selected ? styles.daySelectedText : null,
                          ]}
                        >
                          {day.day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
