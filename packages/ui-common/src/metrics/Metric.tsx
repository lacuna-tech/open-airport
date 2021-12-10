/**
 * Immutable Metric baseclass.
 * Encapsulates calculation for a Metric with a MetricSlice.
 */
/* eslint-disable no-console */
import get from 'lodash/get'
import lowerCase from 'lodash/lowerCase'
import capitalize from 'lodash/capitalize'

// eslint-disable-next-line import/no-cycle
import {
  MetricAggregators,
  MetricSlice,
  MetricValue,
  MetricCalculation,
  PartialMetricCalculation,
  MetricDataSet,
  MetricSet,
  getMetric,
  aggregateValues
} from '.'
import * as formatters from './format'

/** Types of metric values. */
export type ValueType = 'integer' | 'float' | 'percent' | 'currency' | 'string' | 'choice' | 'integerMap'

/** Groupings of metrics, used to select sets of metrics from the server. */
export type MetricGroup = 'micromobility' | 'tnc' | 'AgencyOverview' | 'ProviderDashboard'

/** Given a MetricValue, format it as a string, e.g. for showing in a table. */
export interface MetricValueFormatter {
  (value: MetricValue, defaultValue: string, metric: Metric): string
}

/**
 * Setup for a single metric, both:
 *  - RawMetrics: directly from the DB, see `definitions/BaseMetric`, and
 *  - DerivedMetrics: derived from RawMetrics, may have `sla` thresholds or calculate values.
 */
export interface MetricProps {
  /** Name of the metric. Use `getMetric(name)` to return it globally. */
  name: string
  /** Logical groups/screens the metric belongs to. See `getMetricGroups()`. */
  groups: MetricGroup[]
  /**  User visible description of usage.  Should be unambiguous and un-techy. */
  description?: string
  /** Value type.  If array, can be any of the specified values. */
  type: ValueType
  /** Can value be `null`? Defaults to `false` if not specified. */
  nullable?: boolean
  /** Precision for numbers -- number of decimal digits. Default is `0` == integer. */
  precision?: number
  /** For `choice` (string) type, allowable values. */
  choices?: string[]
  /** Value for the metric: single database column or calculation. */
  value?: string | MetricCalculation
  /* Aggregation strategy for combining rows in same slice (e.g. different vehicle types). */
  rowAggregator?: MetricAggregators // uses `value` column rowAggregator if not defined
  /** Aggregation strategy for combining slices (e.g. different time slices). */
  timeAggregator?: MetricAggregators // uses `value` column timeAggregator if not defined
  /** SLA or policy threshold value: explicit number, column name or calculation. */
  sla?: number | string | MetricCalculation
  /** SLA threshold operator, e.g. `min` = SLA value is minimum acceptible value. */
  slaOperator?: 'min' | 'max'
  /** SLA threshold aggregator.  Defaults to `first` if not specified. */
  slaAggregator?: MetricAggregators
  /** User-visible units for value. */
  units?: null | 'msec' | 'seconds' | 'meters' | 'vehicles' | 'trips' | 'events' | '%' | 'currency' | 'trips/vehicle'
  /** User-visible title for the metric */
  title?: string
  /** FUTURE: typical: values for an HOUR slice.  Used to generate random metrics.  `[#,#]` and `[#,#,#]` will be used with between() */
  typical?: MetricValue | [number, number] | [number, number, number] | PartialMetricCalculation
  /** Format string or function. */
  format?: MetricValueFormatter | ValueType
}

export class Metric {
  public name: string

  private props: MetricProps

  public constructor(props: MetricProps) {
    this.name = props.name
    this.props = props
    // default `value` to `name` for RawMetrics
    if (!props.value) this.props.value = this.props.name
  }

  /**
   *
   * User visible descriptions of the metric.
   *
   */

  /** User-visible title for the metric */
  public get title() {
    return this.props.title || capitalize(lowerCase(this.props.name))
  }

  /**  Description of usage.  Should be unambiguous. */
  public get description() {
    return this.props.description || capitalize(lowerCase(this.props.name))
  }

  /** User-visible units for value. */
  public get units() {
    return this.props.units
  }

  /** Given a MetricSet, return a description of its SLA, based on the first item in the list.
   * Returns `null` if no SLA value or DataSet is. */
  public getSLADescription(dataSet: MetricDataSet) {
    const { slaValue } = dataSet
    if (!this.hasSLA || typeof slaValue !== 'number') return null
    return `${this.props.slaOperator} ${slaValue} ${this.units}`
  }

  /**
   *
   * values / calculations.
   *
   */

  /* Value type. Used as `formatter` if no explicit `format` specified. */
  public get type(): ValueType {
    return this.props.type
  }

  /**
   * Precision (# of decimal digits) for numbers in aggregation calculations.
   * Default is `2` for float, `0` for everything else.
   */
  public get precision() {
    return this.props.precision || (this.props.type === 'float' ? 2 : 0)
  }

  /** Return the `value` of this metric for a `MetricSlice`. */
  public getValue(slice: MetricSlice): MetricValue {
    const { value } = this.props
    // If a string, assume it's a path in the slice.
    if (typeof value === 'string') return get(slice, value)
    // If a function, call it with the slice.
    if (typeof value === 'function') return value(slice)
    // If a number, assume it's a hard-coded value.
    if (typeof value === 'number') return value
    // Don't know!
    return null
  }

  /** Return `value` for each slice in `set`.  No aggregation. */
  public getValues(set: MetricSet): MetricValue[] {
    return set.slices.map(slice => this.getValue(slice))
  }

  /** Return value formatter string/function. */
  public get formatter(): MetricValueFormatter | ValueType {
    return this.props.format || (this.valueMetric && this.valueMetric.props.format) || this.props.type
  }

  /**
   * Given a `value` from this metric, format it as a user-visible string.
   * If value is `null`/`undefined` or `NaN` and no formatter kicks in, returns `defaultValue`.
   */
  public format(value: MetricValue, defaultValue = '') {
    if (value == null || (typeof value === 'number' && Number.isNaN(value))) return defaultValue

    const { formatter } = this
    if (typeof formatter === 'function') {
      return formatter(value, defaultValue, this)
    }
    if (typeof value === 'number') {
      if (formatter === 'integer' || formatter === 'float') return value.toLocaleString()
      if (formatter === 'percent') return `${value}%`
      if (formatter === 'currency') return formatters.currencyFormatter(value, '-')
    }

    return value
  }

  /**
   * Given a `value` from this metric, format it as a user-visible string, including its units.
   * If value is `null`/`undefined` or `NaN` and no formatter kicks in, returns `defaultValue`.
   */
  public formatWithUnits(value: MetricValue, defaultValue = '') {
    // If we have a custom formatter, assume we should just use that. ???
    if (typeof this.props.format === 'function') return this.format(value, defaultValue)

    const valueString = this.format(value, defaultValue)
    if (!this.units) return valueString

    if (this.formatter === 'percent' || this.formatter === 'currency') return valueString
    return `${valueString} ${this.units}`
  }

  /**
   *
   * Aggregation
   *
   */

  /** Aggregate MetricValues according to our `rowAggregator`. */
  public aggregateRowValues(values: MetricValue[]) {
    return aggregateValues(values, this.rowAggregator, this.precision)
  }

  /** Aggregate MetricValues according to our `timeAggregator`. */
  public aggregateTimeValues(values: MetricValue[]) {
    return aggregateValues(values, this.timeAggregator, this.precision)
  }

  /** Return the `Metric` associated with our `value`.  May be us! */
  private get valueMetric() {
    const { value } = this.props
    return typeof value === 'string' ? getMetric(value) : undefined
  }

  /* Aggregation strategy for combining rows in same slice (e.g. different vehicle types). */
  public get rowAggregator(): NonNullable<MetricAggregators> {
    const { props, valueMetric } = this
    return props.rowAggregator || (valueMetric && valueMetric !== this && valueMetric.rowAggregator) || 'none'
  }

  /** Aggregation strategy for combining slices (e.g. different time slices). */
  public get timeAggregator(): MetricAggregators {
    const { props, valueMetric } = this
    return props.timeAggregator || (valueMetric && valueMetric !== this && valueMetric.timeAggregator) || 'none'
  }

  /**
   *
   * SLA properties / calculations.
   * NOTE: we currently assume that SLA values are always numbers.
   *
   */

  public get hasSLA() {
    return this.props.sla !== undefined
  }

  /** Return the `sla` value for a `MetricSlice`. */
  public getSLAValue(slice: MetricSlice): MetricValue {
    const { sla } = this.props
    if (typeof sla === 'number') return sla
    if (typeof sla === 'function') return sla(slice)
    if (typeof sla === 'string') return get(slice, sla)
    return null
  }

  /** Return `sla` value for each slice in `set`.  No aggregation. */
  public getSLAValues(set: MetricSet): MetricValue[] {
    return set.slices.map(slice => this.getSLAValue(slice))
  }

  /**  Return `true` if `value` violates `slaValue, as numbers`. If no `sla`, `undefined`. */
  public valueViolatesSLA(value: MetricValue | undefined, slaValue: MetricValue | undefined) {
    if (!this.hasSLA || typeof value !== 'number' || typeof slaValue !== 'number') return undefined
    const { slaOperator } = this.props
    return (slaOperator === 'min' && value < slaValue) || (slaOperator === 'max' && value > slaValue)
  }

  /** Pointer to the `Metric` used to get our `sla`, if there is one. */
  private get slaMetric() {
    const { sla } = this.props
    return typeof sla === 'string' ? getMetric(sla) : undefined
  }

  /** Aggregate MetricValues according to our `slaAggregator`. */
  public aggregateSLAValues(values: MetricValue[]) {
    return aggregateValues(values, this.slaAggregator, this.precision)
  }

  /** Threshold aggregator.  Defaults to `first` if not specified. */
  public get slaAggregator() {
    const { props, slaMetric } = this
    return props.slaAggregator || (slaMetric && slaMetric.rowAggregator) || 'first'
  }

  /**
   *
   * Debugging helpers
   *
   */

  // /**
  //  * Typical values for an HOUR slice.
  //  * FUTURE: Used to generate random metrics.
  //  * `[#,#]` and `[#,#,#]` will be used with between()
  //  */
  // public get typical() {
  //   return this.props.typical
  // }

  /**
   * Sanity-check this metric's props against other all other `metrics`.
   * Returns array of errors, which will be empty if everything checks out.
   */
  public sanityCheck() {
    const { name, value, rowAggregator, timeAggregator, sla, slaOperator, slaAggregator } = this.props
    const errors = []

    // String `value` metric references must be findable.
    if (typeof value === 'string' && !getMetric(value)) {
      errors.push(`Metric '${name}' has unknown 'value': ${value}`)
    }

    // Function metric values must have explit `rowAggregator` and `timeAggregator`
    if (typeof value === 'function' && !rowAggregator) {
      errors.push(`Metric '${name}' has 'value' function but no 'rowAggregator'`)
    }
    if (typeof value === 'function' && !timeAggregator) {
      errors.push(`Metric '${name}' has 'value' function but no 'timeAggregator'`)
    }

    // String `sla` reference must be findable.
    if (typeof sla === 'string' && !getMetric(sla)) {
      errors.push(`Metric '${name}' has unknown 'sla': '${sla}'`)
    }

    // Must have `slaOperator` if we have an `sla`.
    if (sla && !slaOperator) {
      errors.push(`Metric '${name}' has 'sla' but no 'slaOperator'`)
    }
    // Function `sla`s must have explicit `slaOperator`.
    if (typeof sla === 'function' && !slaAggregator) {
      errors.push(`Metric '${name}' has 'sla' but no 'slaAggregator'`)
    }

    return errors
  }
}
