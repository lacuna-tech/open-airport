/** Utilities for creating weekly metrics data for Providers which looks "reasonable". */

/* eslint-disable no-console  */
import { DateTime } from 'luxon'

import { getProviderName } from '../store'

import chirp from './samples/chirp'
import dryft from './samples/dryft'
import lazor from './samples/lazor'
import pump from './samples/pump'
import thyme from './samples/thyme'
import twirl from './samples/twirl'

/** Raw data comes in from CSV in this format: */
export interface ProviderSampleRow extends Record<string, string | number> {
  /** Source date string, ASSUMED TO BE IN SAME TIMEZONE!!! */
  date: string
  /** Vehicles available for rent. */
  available: number
  /** On-trip or otherwise reserved in app. */
  reserved: number
  /** Dead vehicles in ROW. */
  unavailable: number
  /** Toral registered vehicles */
  total: number
  /** Unique trips w/in hour */
  trip_count: number
  /** Percent of start/end events out of SLA */
  start_end_latency: number
  /** Percent of telemetry events out of SLA */
  telemetry_latency: number
  /** DERIVED: Day-of-week as a number */
  day: number
  /** DERIVED: 24 hour w/in day */
  hour: number
  /** DERIVED: set from the below */
  cap: number
}

const providerCaps: { [key in string]: number } = {
  chirp: 5000,
  dryft: 2000,
  lazor: 1200,
  pump: 2500,
  thyme: 3000,
  twirl: 500
}

function massageCSV(name: string, sourceText: string, output?: boolean) {
  /** Pop off first row as header */
  const rows: string[] = sourceText.trim().split('\n')!
  const headers = rows.shift()!.split(',')

  return rows.map(rowText => {
    // Convert to CSVRow object.
    const csvRow: Partial<ProviderSampleRow> = {}
    csvRow.cap = providerCaps[name] || 3000

    const columns = rowText.split(',')
    headers.forEach((header, colNum) => {
      csvRow[header] = columns[colNum] || '0'
      if (header === 'date') {
        const date = DateTime.fromFormat(csvRow[header] || '', 'LL/dd/yy HH:mm')
        if (!date.isValid) throw new TypeError(`massageCSV(): invalid date: '${csvRow[header]}' in row: ${rowText}`)
        csvRow.day = date.weekday
        csvRow.hour = date.hour
      } else {
        const intValue = parseInt(csvRow[header] as string)
        if (!Number.isNaN(intValue)) csvRow[header] = intValue
      }
    })
    // throw if we didn't get a date!
    if (!csvRow.date) throw new TypeError(`massageCSV(): no date! in row: ${rowText}`)
    if (output) console.warn(output)
    return csvRow as ProviderSampleRow
  })
}

let providerSamples: { [key: string]: ProviderSampleRow[] }
export function getProviderSampleForHour(start_time: number, provider_id: string) {
  // Set up on first invocation.
  // This should make sure DateTime.now() timestamp is set.
  if (!providerSamples) {
    providerSamples = {
      chirp: massageCSV('chirp', chirp),
      dryft: massageCSV('dryft', dryft),
      lazor: massageCSV('lazor', lazor),
      pump: massageCSV('pump', pump),
      thyme: massageCSV('thyme', thyme),
      twirl: massageCSV('twirl', twirl)
    }
    // console.table(providerSamples.chirp)
  }
  const date = DateTime.fromMillis(start_time)
  const day = date.weekday
  const { hour } = date
  const providerName = getProviderName(provider_id, 'chirp').toLowerCase()
  const provider = providerSamples[providerName] || providerSamples.chirp
  return provider.find(row => row.day === day && row.hour === hour)
}
