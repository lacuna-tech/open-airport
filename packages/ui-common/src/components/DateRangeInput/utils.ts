import { DateRange, OpenDateRange, ClosedDateRange } from './types'

/**
 * Format a DateRangeValue as a simple string of the form "[start, end]", where
 * `start` and `end` are ISO-8601 formatted datetime strings. If either `start`
 * or `end` are missing from the range, they are represented by the infinity stymbol
 * (∞).
 *
 * Utility function primarily useful for checking the equality of two date ranges in
 * a diffable way for use in jest tests.
 *
 * @param dateRange The DateRangeValue to format.
 * @returns Formatted DateRangeValue.
 */
export const formatDateRange = (dateRange: DateRange) => {
  const formattedStart = dateRange.start?.setZone('utc').toISO() ?? '∞'
  const formattedEnd = dateRange.end?.setZone('utc').toISO() ?? '∞'
  return `[${formattedStart}, ${formattedEnd}]`
}

export const isOpenDateRange = (dateRange: DateRange): dateRange is OpenDateRange =>
  dateRange.start == null || dateRange.end == null

export const isClosedDateRange = (dateRange: DateRange): dateRange is ClosedDateRange => !isOpenDateRange(dateRange)
