/**
 * MetricDataSet: immutable representation for values for a `MetricSet`.
 * TODO: memoize `values` etc.
 */
/* eslint-disable no-console */

import map from 'lodash/map'
import zipWith from 'lodash/zipWith'

import { Serie, Datum } from '@nivo/line'

import { getProviderById, getProviderName } from '../store'
// eslint-disable-next-line import/no-cycle
import { getTimeAxisFormatter } from '../components/charts/chartUtils'

// eslint-disable-next-line import/no-cycle
import { MetricDataPoint, MetricValue, Metric, MetricSet, aggregateValues } from '.'

export interface MetricDataSetProps {
  /** Metric used to extract the data. */
  metric: Metric

  /** Key used to split the data. */
  keyProperty: string

  /** List of datapoints. */
  data: MetricDataPoint[]

  /** Original set of metrics the data came from. */
  metricSet: MetricSet
}

export class MetricDataSet {
  /** Metric used to extract the data. */
  public metric: Metric

  /** Key property name used to split the data. */
  public keyProperty: string

  /** List of datapoints. */
  public data: MetricDataPoint[]

  /** Original set of metrics the data came from. */
  public metricSet: MetricSet

  public constructor(props: MetricDataSetProps) {
    this.metric = props.metric
    this.keyProperty = props.keyProperty
    this.data = props.data
    this.metricSet = props.metricSet
  }

  /** Return number of records */
  public get length(): number {
    return this.data.length
  }

  /** Return all `values` */
  public get values(): MetricValue[] {
    return map(this.data, 'value')
  }

  /** Return all `keys` */
  public get keys() {
    return map(this.data, 'key') as string[]
  }

  /** Return all `start_time`s as timestamps (numbers). */
  public get start_times() {
    return map(this.data, 'start_time') as number[]
  }

  /** Return all `start_time`s as dates.  TODO:  moment?? */
  public get startTimes() {
    return map(this.data, ({ start_time }) => new Date(start_time)) as Date[]
  }

  /** Return all `slaValues` */
  public get slaValues() {
    return map(this.data, 'slaValue') as number[] | undefined
  }

  /* Return `values` which are within corresponding SLA value, or `null` if out of SLA. */
  public get valuesWithinSLA(): MetricValue[] {
    const { values, violations } = this
    if (!violations) return values
    return values.map((value, index) => (violations[index] ? null : value))
  }

  /* Return `values` which are NOT WITHING corresponding SLA value, or `null` if out of SLA. */
  public get valuesOutsideOfSLA(): MetricValue[] {
    const { values, violations } = this
    if (!violations) return values
    return values.map((value, index) => (violations[index] ? value : null))
  }

  /** Are there any violations in the set? */
  public get hasViolations() {
    const { violations } = this
    return violations ? violations.some(Boolean) : false
  }

  /** Return all `violations` */
  public get violations() {
    return map(this.data, 'violation') as boolean[]
  }

  /** Range of numeric values as `{ min, max }` */
  public get range() {
    const numericValues = this.values.filter(value => typeof value === 'number') as number[]
    return { max: Math.max(...numericValues), min: Math.min(...numericValues) }
  }

  /**
   * Nivo-specific helpers
   */

  public static getRangeForSets(dataSets: MetricDataSet[]) {
    const ranges = dataSets.map(dataSet => dataSet.range)
    return {
      min: Math.min(...ranges.map(range => range.min)),
      max: Math.max(...ranges.map(range => range.max))
    }
  }

  /** Zip 2 arrays together returning Nivo LineDatum[]. */
  public static zipNivoLineData(xValues?: MetricValue[], yValues?: MetricValue[]) {
    const data = zipWith(xValues || [], yValues || [], (x, y) => (({ x, y } as unknown) as Datum))
    // remove any NaN values
    return data.filter(datum => !Number.isNaN(datum.y as number))
  }

  /** Return `values` (and possibly `slaValues`) as nivo timeseries data. */
  public getNivoTimeLineData({ includeSLA = true, separateSLA = false, title = this.metric.title } = {}) {
    const { values, violations } = this
    const data: Serie[] = []
    if (!includeSLA || !this.hasSLA) {
      data.push({
        id: title,
        data: MetricDataSet.zipNivoLineData(this.startTimes, this.values)
      })
    } else if (!separateSLA) {
      data.push(
        {
          id: title,
          data: MetricDataSet.zipNivoLineData(this.startTimes, this.values)
        },
        {
          id: `${title}-SLA`,
          data: MetricDataSet.zipNivoLineData(this.startTimes, this.slaValues)
        }
      )
    } else {
      // Split into `good` and `bad` values.
      const good = [...values]
      const bad = [...values]
      values.forEach((value, index) => {
        // NOTE in order to draw a line, you have to have at least two points!
        // So we attempt to figure out edges and only null out values w/not on an edge.
        const violation = violations[index]
        const isEdge = violations[index - 1] !== violation
        if (violation) {
          if (!isEdge) good[index] = null
        } else if (!isEdge) bad[index] = null
      })

      data.push(
        {
          id: `${title}-good`,
          data: MetricDataSet.zipNivoLineData(this.startTimes, good)
        },
        {
          id: `${title}-bad`,
          data: MetricDataSet.zipNivoLineData(this.startTimes, bad)
        },
        {
          id: `${title}-SLA`,
          data: MetricDataSet.zipNivoLineData(this.startTimes, this.slaValues)
        }
      )
    }
    return data
  }

  /** Return data for multiple provider dataSets formatted for Nivo bar charts. */
  public static getProvidersBarData(providers: MetricDataSet[], showTimesAsRanges = false) {
    // Get default time formatter according to `bin_size`, assumed to be the same for all dataSets.
    const format = getTimeAxisFormatter(providers[0] && providers[0].binSize, showTimesAsRanges)
    const results: {
      time: string
      [key: string]: MetricValue
    }[] = providers[0].startTimes.map(time => {
      return { time: format(time) as string }
    })

    providers.forEach(({ providerName, values }) => {
      values.forEach((value, index) => {
        if (results[index]) results[index][providerName] = value
      })
    })

    return results
  }

  /**
   * Return marker data for multiple provider dataSets formatted for Nivo bar charts.
   * Assumes: all providers using same metric.
   * Assumes: it's ok to just take the first slaValue for each provider.
   * */
  public static getProvidersMarkerData(providers: MetricDataSet[]) {
    if (providers.length === 0) return null
    const { metric } = providers[0]
    if (!metric.hasSLA) return null
    const slaValues = providers.map(({ slaValue }) => slaValue) as MetricValue[]
    return aggregateValues(slaValues, metric.slaAggregator, 0)
  }

  /**
   *
   * Aggregate syntactic sugar -- returns value for first slice
   *
   */

  /** Return the `start_times` as a number for the FIRST row, or `undefined`. */
  public get start_time() {
    return this.start_times ? this.start_times[0] : undefined
  }

  /** Return the raw `value` for the FIRST row, or `undefined`. */
  public get value() {
    return this.values[0]
  }

  /** Return the formatted `value` (according to our `metric`) for the FIRST row, or `undefined`. */
  public get formattedValue() {
    return this.format(this.value)
  }

  /** Return the `hasSLA` for the FIRST row, or `undefined`. */
  public get hasSLA() {
    return this.metric.hasSLA
  }

  /** Return the `slaValue` for the FIRST row, or `undefined`. */
  public get slaValue() {
    return this.slaValues ? this.slaValues[0] : undefined
  }

  /** Return the `violation` flag for the FIRST row, or `undefined`. */
  public get violation() {
    return this.violations ? this.violations[0] : undefined
  }

  /** Return the `provider_id` for the FIRST row, or `undefined`. */
  public get providerId() {
    const slice = this.metricSet.slices[0]
    return slice && slice.provider_id
  }

  /** Return the `provider` for the FIRST row, or `undefined`. */
  public get provider() {
    const slice = this.metricSet.slices[0]
    return slice && getProviderById(slice.provider_id)
  }

  /** Return the `provider_id` for the FIRST row, or `undefined`. */
  public get providerName() {
    const slice = this.metricSet.slices[0]
    return slice && getProviderName(slice.provider_id)
  }

  /** Return the `bin_size` of the FIRST row in our `metricSet`, or `undefined`. */
  public get binSize() {
    const slice = this.metricSet.slices[0]
    return slice && slice.bin_size
  }

  /** Return the `slaDescription` for the first slice in this dataSet, or `undefined` */
  public get slaDescription() {
    return this.metric.getSLADescription(this)
  }

  /** Format a `value` according to our metric. */
  public format(value: MetricValue, defaultValue = '') {
    return this.metric.format(value, defaultValue)
  }

  /**
   *
   * Debug
   *
   */

  /** Show the metric by printing to console. */
  public show() {
    console.group('Metric: ', this.metric, 'metricSet: ', this.metricSet)
    console.table(this.data)
    console.groupEnd()
    return this.data
  }
}
