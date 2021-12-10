import { DateTime } from 'luxon'

export type DateTimeUnit = 'year' | 'month' | 'hour' | 'minute' | 'second' | 'millisecond'
const units: DateTimeUnit[] = ['year', 'month', 'hour', 'minute', 'second', 'millisecond']

/* Adapted from: https://github.com/moment/moment/issues/959#issuecomment-498258557 */
export const roundDown = ({
  dateTime,
  quantity,
  unit
}: {
  dateTime: DateTime
  quantity: number
  unit: DateTimeUnit
}) => {
  // Zero-out less significant units in the date.
  const pos = units.indexOf(unit)
  let roundedDateTime = dateTime
  for (let i = pos + 1; i < units.length; i++) {
    roundedDateTime = roundedDateTime.set({ [units[i]]: 0 })
  }

  roundedDateTime = roundedDateTime.set({ [unit]: Math.floor(dateTime.get(unit) / quantity) * quantity })

  return roundedDateTime
}

export const flexiblyParseDateTime = (date: string | number | Date): DateTime => {
  if (typeof date === 'string') {
    return DateTime.fromISO(date)
  }
  if (typeof date === 'number') {
    return DateTime.fromMillis(date)
  }
  return DateTime.fromJSDate(date)
}
