import { DateTime } from 'luxon'

export type OpenDateRange =
  | {
      start: DateTime
      end: null
    }
  | {
      start: null
      end: DateTime
    }

export type ClosedDateRange = {
  start: DateTime
  end: DateTime
}

export type DateRange = OpenDateRange | ClosedDateRange
