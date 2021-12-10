import React from 'react'
import { DateTime, Settings as DateTimeSettings } from 'luxon'

import { DateRange } from './types'

export interface UseDateRangeInputArgs {
  value: DateRange | null
  timezone?: string
  withTime?: boolean
  onChange?(value: DateRange | null): void
}

export const useDateRangeInput = ({
  value,
  timezone = DateTimeSettings.defaultZoneName,
  withTime = false,
  onChange
}: UseDateRangeInputArgs) => {
  return {
    actions: {
      updateStart: React.useCallback(
        (newStart: DateTime | null) => {
          let end = value?.end ?? null
          // If both start and end dates are now null, return null to signify
          // no value.
          if (newStart == null && end == null) {
            onChange?.(null)
            return
          }

          // If withTime is not specified we'll throw away the local time
          // and replace it with the start of the day for the date passed.
          let start = newStart
          if (!withTime) {
            start = start?.setZone(timezone).startOf('day') || null
          }

          // Adjust the end date so that we don't end up with a date range
          // where start > end.
          if (newStart != null && end != null && newStart > end) {
            end = newStart.plus({ hours: 1 })
            if (!withTime) {
              end = end.setZone(timezone).endOf('day')
            }
          }
          onChange?.({ start, end } as DateRange)
        },
        [onChange, timezone, withTime, value]
      ),
      updateEnd: React.useCallback(
        (newEnd: DateTime | null) => {
          let start = value?.start ?? null
          // If both start and end dates are now null, return null to signify
          // no value.
          if (newEnd == null && start == null) {
            onChange?.(null)
            return
          }

          // If withTime is not specified we'll throw away the local time
          // and replace it with the end of the day for the date passed.
          let end = newEnd
          if (end != null && !withTime) {
            end = end.setZone(timezone).endOf('day')
          }

          // Adjust the start date so that we don't end up with a date range
          // where start > end.
          if (start != null && end != null && end < start) {
            start = end.minus({ hours: 1 })
            if (!withTime) {
              start = start.setZone(timezone).startOf('day')
            }
          }
          onChange?.({ start, end } as DateRange)
        },
        [onChange, timezone, withTime, value]
      )
    }
  }
}
