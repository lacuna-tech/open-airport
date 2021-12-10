import { DateTime } from 'luxon'
import { MetricValue } from './types'

/**
 * Formatting utilities
 */

/**
 * Given duration value in milliseconds returns a human readable
 * XXh:YYm:ZZs if > 1hour, YYm:ZZs if < 1hour, ZZs if < 1 min, 1s if < 1s but > 0
 * Leading zeros removed
 */
export function smallTimeFormatter(value: MetricValue, defaultValue = '-'): string {
  // debugger
  if (value === undefined || value === null || typeof value !== 'number') return defaultValue
  let fValue = defaultValue
  const sec = DateTime.fromMillis(value, { zone: 'utc' }).toFormat('ss')
  const min = DateTime.fromMillis(value, { zone: 'utc' }).toFormat('mm')
  const hrs = DateTime.fromMillis(value, { zone: 'utc' }).toFormat('hh')

  if (value === 0) return `0s`
  if (value > 0 && value < 1 * 1000) return `< 1s`

  if (value >= 1 * 1000 && value < 60 * 1000) {
    // < 60s
    fValue = `${sec}s`
    if (fValue[0] === '0') fValue = fValue.slice(1)
  } else if (value < 60 * 60 * 1000) {
    // < 1hr
    fValue = `${min}m:${sec}s`
    if (fValue[0] === '0') fValue = fValue.slice(1)
  } else if (value > 60 * 60 * 1000) {
    // > 1hr
    fValue = `${hrs}h:${min}m:${sec}s`
    if (fValue[0] === '0') fValue = fValue.slice(1)
  }

  return fValue
}

/**
 * Returns human readable currency value with dollar sign and commas.
 */
export function currencyFormatter(value: MetricValue, defaultValue = '-'): string {
  if (value === undefined || value === null || typeof value !== 'number') {
    return defaultValue
  }
  return `$${value.toLocaleString()}`
}
