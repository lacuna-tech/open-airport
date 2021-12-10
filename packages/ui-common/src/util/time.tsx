import { DateTime } from 'luxon'

/**
 * @param startDate Start date of range
 * @param endDate  End date of range
 * @returns Random DateTime object between startDate and endState
 */
export const getRandomDateTime = (startDate: DateTime, endDate: DateTime): DateTime => {
  const range = endDate.diff(startDate)
  return startDate.plus(Math.random() * range.toMillis())
}

/**
 * Returns random time within range
 * @param min time in seconds
 * @param max time in seconds
 */
export function getTimeInRange(min: number, max: number) {
  const minMs = min * 1000
  const maxMs = max * 1000
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}
