/* eslint-disable no-console */
/**
 * Set of MetricSlice records with methods to manipulate them.
 */
import filter from 'lodash/filter'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import _set from 'lodash/set'

import { getProviders, getProviderName } from '../store'

// eslint-disable-next-line import/no-cycle
import {
  MetricValue,
  MetricSlice,
  PartialMetricSlice,
  MetricSliceFilter,
  MetricDataPoint,
  getMetric,
  Metric,
  MetricDataSet,
  RawMetrics,
  BinSize
} from '.'
// eslint-disable-next-line import/no-cycle
import { translateTimeToKeyByBinSize, endOf, startEndOf } from './datetime-helper'

export const MSEC_IN_AN_5MIN = 5 * 60 * 1000
export const MSEC_IN_AN_HOUR = 60 * 60 * 1000
export const MSEC_IN_A_DAY = 24 * MSEC_IN_AN_HOUR

export class MetricSet {
  public slices: MetricSlice[] = []

  public constructor(_slices?: MetricSlice[]) {
    // Remove any empty slices.
    if (_slices) this.slices = _slices.filter(Boolean)
  }

  /** Join multiple MetricSets into one. Doesn't attempt to sort or uniquify. */
  public static join(...sets: MetricSet[]) {
    const slices = flatten(map(sets, 'slices'))
    return new MetricSet(slices)
  }

  /**
   *
   * Property syntactic sugar
   *
   */

  /** Number of metrics in the set. */
  public get length() {
    return this.slices.length
  }

  /** Return the earliest `start_time` in the set, or `undefined`. */
  public get start_time() {
    const first = this.earliest.slices[0]
    return first && first.start_time
  }

  /** Return the latest `start_time` in the set. */
  public get last_start_time() {
    return this.slices
      .map(slice => get(slice, 'start_time'))
      .sort()
      .reverse()[0]
  }

  /** Return the earliest `bin_size` in the set, or `undefined`. */
  public get bin_size() {
    const first = this.earliest.slices[0]
    return first && first.bin_size
  }

  /** `provider_id` of first item in the set or `undefined`.  ASSUMES: all are for the same provider. */
  public get provider_id() {
    return this.slices[0] && this.slices[0].provider_id
  }

  /** Provider NAME of first item in the set or `undefined`.  ASSUMES: all are for the same provider. */
  public get providerName() {
    return this.slices[0] && getProviderName(this.slices[0].provider_id)
  }

  /**
   * Return single property of each MetricSlice, as string or `dotted.path`
   */
  public get(path: string): MetricValue[] {
    return this.slices.map(slice => get(slice, path))
  }

  /**
   *
   * Manipulating sets
   *
   */

  /**
   * Combine this set with another MetricSet, returning a new one.
   * Sorts output slices rationally.
   */
  public concat(otherSet: MetricSet) {
    return new MetricSet(MetricSet.sortSlicesHelpfully([...this.slices, ...otherSet.slices]))
  }

  /**
   * Combine this set with another MetricSet, returning a new one,
   * but making sure that matching rows only appear once!
   * Sorts output slices rationally.
   */
  public concatUnique(otherSet: MetricSet) {
    const slices = Object.values({ ...this.sliceMap, ...otherSet.sliceMap })
    return new MetricSet(MetricSet.sortSlicesHelpfully(slices))
  }

  /** Return a map of all slices by `sliceKey` */
  public get sliceMap() {
    return keyBy(this.slices, MetricSet.getSliceKey)
  }

  /** Return a repeatable unique key for a particular MetricSlice. */
  public static getSliceKey(slice: MetricSlice) {
    const { provider_id, geography, start_time, bin_size, vehicle_type } = slice
    return [provider_id, geography, start_time, bin_size, vehicle_type].join('/')
  }

  /** Sort a set of slices in helpful order. */
  public static sortSlicesHelpfully(slices: MetricSlice[]) {
    return sortBy(slices, 'provider_id', 'geography', 'start_time', 'bin_size')
  }

  /**
   * Return new MetricSet where all slices match `filter`.
   * Lodash `filter` semantics:
   *  - `undefined` (or no argument) to clone this set
   *  - `string` to filter where property is `truthy` (top-level properties only)
   *  - `object` to filter by `_.matches()`
   *  - `[property, value]` or `property, value` to filter by `_.matchesProperty()`
   *  - `(slice): boolean` function for custom determination
   */
  public filter(
    firstArg?: MetricSliceFilter | string | PartialMetricSlice | [string, MetricValue],
    secondArg?: string
  ): MetricSet {
    if (arguments.length === 0 || firstArg === undefined) {
      return new MetricSet(this.slices)
    }
    let _filter = firstArg
    // special case for passing `property, value` rather than `[property, value]` cause... Owen.
    if (typeof firstArg === 'string' && typeof secondArg === 'string') {
      _filter = [firstArg, secondArg]
    }
    return new MetricSet(filter(this.slices, _filter))
  }

  /**
   * Semantic sugar filters
   */

  /** Return "hour" slices only. */
  public get hours() {
    return this.filter(['bin_size', 'hour'])
  }

  /** Return "day" slices only. */
  public get days() {
    return this.filter(['bin_size', 'day'])
  }

  /** Return "month" slices only. */
  public get months() {
    return this.filter(['bin_size', 'month'])
  }

  /** Filter to just the "first" metric slice in the set. */
  public get first() {
    return new MetricSet([this.slices[0]])
  }

  /** Filter to the "last" metric slice in the set. */
  public get last() {
    return new MetricSet([this.slices[this.length - 1]])
  }

  /** Filter to all slices which match the earliest `start_time` in the set. */
  public get earliest() {
    const sorted = this.sortBy('start_time')
    if (sorted.length) return sorted.forTime(sorted.slices[0].start_time)
    return new MetricSet()
  }

  /** Return slices that match a particular provider. */
  public forProvider(provider_id: string) {
    return this.filter(['provider_id', provider_id])
  }

  /** Return slices that match a particular provider by provider NAME. */
  public forProviderName(provider_name: string) {
    // ASSUMES: providers have been loaded!
    const provider = getProviders()!.find(p => p.provider_name === provider_name)
    if (!provider) {
      console.warn(`metricSet.forProviderName(${provider_name}): provider not found`)
      return new MetricSet()
    }
    return this.filter(['provider_id', provider.provider_id])
  }

  /** Return slices that match a particular set of providers. */
  public forProviders(provider_ids: string[]) {
    return this.filter(({ provider_id }) => provider_ids.includes(provider_id))
  }

  /** Return slices that match a particular geography. */
  public forGeography(geography: string | null) {
    return this.filter(['geography', geography])
  }

  /** Return slices that match a particular exact start_time. */
  public forTime(start_time: number) {
    return this.filter(['start_time', start_time])
  }

  /** Return slices that fall between a particular start / end time, inclusive. */
  public forTimeRange(start_time: number, end_time: number) {
    return this.filter(slice => {
      const slice_end = endOf({ time: slice.start_time, bin_size: slice.bin_size, forNextBinSizeUp: false })
      const { start_time: slice_start } = slice
      return slice_start >= start_time && slice_end <= end_time
    })
  }

  /** Return all "day" and "hour" slices for the specified day.
   * ASSUMES `dayStartTime` is a day start timestamp, in the correct timezone. */
  public forDay(dayStartTime: number) {
    return this.forTimeRange(dayStartTime, dayStartTime + MSEC_IN_A_DAY)
  }

  public forBinSize(time: number, bin_size: BinSize) {
    const [startTime, endTime] = startEndOf({ time, bin_size, forNextBinSizeUp: true })
    return this.filter('bin_size', bin_size).forTimeRange(startTime, endTime).groupByBinSize(bin_size)
  }

  /** Return all "day" and "hour" slices from the last "day" in the set,
   * e.g. everything for "yesterday".
   * Logs a warning and returns empty set if there are no "day" records in the set.
   */
  public get lastDay() {
    const lastDay = this.days.sortBy('start_time').last.slices[0]
    if (!lastDay) {
      console.warn("metricSet.lastDay(): must have at least one 'day' record.  Original metricSet:", this)
      return new MetricSet()
    }
    return this.forDay(lastDay.start_time)
  }

  /**
   * Split into array of MetricSets by unique property `path` value.
   * Keeps input order, do a `sortBy()` before you split to set order of split entries.
   */
  public split(path: string): MetricSet[] {
    const splits: MetricSlice[][] = []
    const keyMap: { [key: string]: MetricSlice[] } = {}
    this.slices.forEach(slice => {
      const value = `${get(slice, path)}`
      if (!keyMap[value]) {
        keyMap[value] = []
        splits.push(keyMap[value])
      }
      keyMap[value].push(slice)
    })
    return splits.map(slices => new MetricSet(slices))
  }

  public groupBy(predicate: (slice: MetricSlice) => string | number): MetricSet[] {
    const keyMap = this.slices.reduce<{ [key: string]: MetricSlice[] }>((newMap, slice) => {
      const key = predicate(slice)
      return { ...newMap, [key]: key in newMap ? [...newMap[key], slice] : [slice] }
    }, {})
    return Object.keys(keyMap).map(key => new MetricSet(keyMap[key]))
  }

  public groupByBinSize(bin_size: BinSize): MetricSet[] {
    return this.groupBy(({ start_time }) => translateTimeToKeyByBinSize({ start_time, bin_size }))
  }

  /** Return a new MetricSet with slices sorted by one or more metrics in ascending order. */
  public sortBy(...keys: string[]) {
    return new MetricSet(sortBy(this.slices, ...keys))
  }

  /**
   * Return all slices in TSV format.
   */
  public toTSV() {
    const baseMetricNames = map(RawMetrics, 'name')
    const output: string[] = []
    output.push(baseMetricNames.join('\t'))
    this.slices.forEach(slice => {
      const row = baseMetricNames.map(name => get(slice, name))
      output.push(row.join('\t'))
    })
    return output.join('\n')
  }

  /**
   * Return all slices as JSON.
   */
  public toJSON(pretty = false) {
    if (pretty) return JSON.stringify(this.slices, null, '  ')
    return JSON.stringify(this.slices)
  }

  /** Return just the raw values for a specified metric with no splitting, no SLAs, etc. */
  public getMetricValues(_metric: string | Metric): MetricValue[] | undefined {
    const metric = typeof _metric === 'string' ? getMetric(_metric) : _metric
    if (!metric) return undefined
    return metric.getValues(this)
  }

  /**
   * Return a MetricDataSet for the specified `metric` after splitting by `keyPropery`.
   * To get a time series, use the default `start_time`.
   * Multiple slices will be aggregated according to `metric.rowAggregator`.
   * Returns `undefined` if metric not found.
   * TOOD: for a different `keyProperty`, you might want a different aggregator. ???
   */
  public getMetricData(_metric: string | Metric, keyProperty = 'start_time'): MetricDataSet | undefined {
    const metric = typeof _metric === 'string' ? getMetric(_metric) : _metric
    if (!metric) return undefined
    // console.time(`---time for: getMetricData(${metric.name})`)
    // divide into sets by start_time...
    const data = this.split(keyProperty).map(set => {
      const key = get(set.slices[0], keyProperty)
      const { start_time } = set.slices[0]

      // get all values and then use rowAggregatorgregator to combine into a single value
      const rawValues = metric.getValues(set)
      const value = metric.aggregateRowValues(rawValues)
      const result: MetricDataPoint = { start_time, value }
      if (keyProperty !== 'start_time') result.key = key

      if (metric.hasSLA) {
        if (typeof value !== 'number') {
          console.warn(`metric ${metric.name}: attempting to apply SLA to non-numeric value:`, value)
        } else {
          const slaValues = metric.getSLAValues(set)
          result.slaValue = metric.aggregateSLAValues(slaValues)
          result.violation = metric.valueViolatesSLA(value, result.slaValue)
        }
      }
      return result
    })
    // console.timeEnd(`---time for: getMetricData(${metric.name})`)
    return new MetricDataSet({ metric, keyProperty, data, metricSet: this })
  }

  /**
   *
   * Generic MetricSlice utilities
   *
   */

  /** Given a slice, return its `end_time` according to its `start_time` and `bin_size`. */
  public static sliceEndTime(slice: MetricSlice) {
    switch (slice.bin_size) {
      case 'hour':
        return slice.start_time + MSEC_IN_AN_HOUR
      case 'day':
        return slice.start_time + MSEC_IN_A_DAY
      default:
        throw new TypeError('Complete implementation of MetricSet.sliceEndTime()')
    }
  }

  /**
   * Aggregate all slices in a metricSet of `oldBinSize` to a `newBinSize`.
   */
  public aggregateTimeBin(oldBinSize: BinSize, newBinSize: BinSize) {
    const newBinGroups = this.filter('bin_size', oldBinSize).groupBy(
      ({ start_time, provider_id, vehicle_type }) =>
        `${translateTimeToKeyByBinSize({ start_time, bin_size: newBinSize })}_${provider_id}_${vehicle_type}`
    )
    const newBinSlices = newBinGroups.map(group => {
      const aggregated: PartialMetricSlice = { bin_size: newBinSize }
      RawMetrics.forEach(metric => {
        if (metric.name === 'bin_size') return
        const value = metric.aggregateTimeValues(metric.getValues(group))
        // NOTE: must use lodash `set` because some metric names are dotted.paths
        _set(aggregated, metric.name, value)
      })
      return aggregated as MetricSlice
    })
    return new MetricSet(newBinSlices)
  }
}
