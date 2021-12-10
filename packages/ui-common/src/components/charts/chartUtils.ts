import { DateTime } from 'luxon'
import { TickFormatter } from '@nivo/axes'

// eslint-disable-next-line import/no-cycle
import { MetricDataSet, BinSize } from '../../metrics'
import { flexiblyParseDateTime } from '../../util/datetime'

export interface CommonChartProps {
  /** Default max value if all values are 0 */
  defaultMaxValue?: number
  /** Formatter function for time axis values.
   * - Specify a `BinSize` to use formatters from `getTimeAxisFormatter()`.
   * - Specify a function as `(date: Date) => string` to use a custom formatter. */
  timeAxisFormatter?: BinSize | TickFormatter
  /** If true and `timeAxisFormatter` is a BinSize, we'll show the time axis as a range. */
  showTimesAsRanges?: boolean
  /** `tickValues` for time axis, e.g. `every day`, `every 2 hours`.
   * If `undefined`, Nivo will let d3 figure it out based on chart size, etc. */
  timeAxisTickValues?: string
  binSize?: BinSize
}

export interface SingleChartProps extends CommonChartProps {
  /** MetricDataSet to display. */
  dataSet?: MetricDataSet
  /** Default max value if all values are 0 */
  defaultMaxValue?: number
}

export interface MultiChartProps extends CommonChartProps {
  /** MetricDataSet[] to display. */
  dataSets: MetricDataSet[]
  /** Should we show a marker for the SLA value? */
  showMarker?: boolean
  /** Title for the marker line, if present. */
  markerTitle?: string
  /** Stack lines in chart? */
  stacked?: boolean
  /** Show area? */
  showArea?: boolean
}

/** Time axis formatters for single-time values. */
const SINGLE_TIME_AXIS_FORMATTERS: { [key in BinSize]: TickFormatter } = {
  // `12pm` or `1:30am`.  NOTE: we ingore seconds!
  hour: date => {
    const start = flexiblyParseDateTime(date)
    if (start.minute !== 0) return start.toFormat('h:mma')
    return start.toFormat('ha')
  },
  // `3/21` or `3/21/2019` if year is different
  day: date => {
    const start = flexiblyParseDateTime(date)
    const thisYear = DateTime.now().year
    const format = start.year === thisYear ? 'L/d' : 'L/d/yyyy'
    return start.toFormat(format)
  },
  month: date => flexiblyParseDateTime(date).toFormat('LLL yyyy'),
  year: date => flexiblyParseDateTime(date).toFormat('yyyy')
}
/** Time axis formatters for time ranges. */
const RANGE_TIME_AXIS_FORMATTERS: { [key in BinSize]: TickFormatter } = {
  // e.g. `1-2am` or `11am-12pm`
  hour: date => {
    const start = flexiblyParseDateTime(date)
    const end = start.plus({ hour: 1 })
    const startHour = start.toFormat('h')
    const startMeridian = start.toFormat('a')
    const endHour = end.toFormat('h')
    const endMeridian = end.toFormat('a')
    if (startMeridian === endMeridian) return `${startHour} - ${endHour}${endMeridian}`
    return `${startHour}${startMeridian} - ${endHour}${endMeridian}`
  },
  day: SINGLE_TIME_AXIS_FORMATTERS.day,
  month: SINGLE_TIME_AXIS_FORMATTERS.month,
  year: SINGLE_TIME_AXIS_FORMATTERS.year
}
/** Return default time axis formatter:
 * - pass a custom formatter as `(date) => string`
 * - pass a `MetricDataSet` to use its `BinSize` in the maps above.
 * - or specify an explicit `BinSize` for the maps above.
 * If `showTimesAsRanges` is true, we'll draw the time as a range.
 */
export function getTimeAxisFormatter(
  timeAxisFormatter: MetricDataSet | BinSize | TickFormatter = 'day',
  showTimesAsRanges = false
) {
  if (typeof timeAxisFormatter === 'function') return timeAxisFormatter
  const timeAxes = showTimesAsRanges ? RANGE_TIME_AXIS_FORMATTERS : SINGLE_TIME_AXIS_FORMATTERS
  if (timeAxisFormatter instanceof MetricDataSet) return timeAxes[timeAxisFormatter.binSize]
  return timeAxes[timeAxisFormatter]
}

/**
 * Tooltip time formatters
 */

/** Tooltip time formatters. */
const TOOLTIP_SINGLE_TIME_FORMATTERS: { [key in BinSize]: TickFormatter } = {
  hour: date => flexiblyParseDateTime(date).toFormat("ccc, D 'at' t"),
  day: date => flexiblyParseDateTime(date).toFormat('ccc, D'),
  month: date => flexiblyParseDateTime(date).toFormat('LLLL yyyy'),
  year: date => flexiblyParseDateTime(date).toFormat('yyyy')
}
const TOOLTIP_RANGE_TIME_FORMATTERS: { [key in BinSize]: TickFormatter } = {
  hour: date => `${flexiblyParseDateTime(date).toFormat("ccc, D 'from'")} ${RANGE_TIME_AXIS_FORMATTERS.hour(date)}`,
  day: TOOLTIP_SINGLE_TIME_FORMATTERS.day,
  month: TOOLTIP_SINGLE_TIME_FORMATTERS.month,
  year: TOOLTIP_SINGLE_TIME_FORMATTERS.year
}
/** Return tooltip time formatter:
 * - pass a custom formatter as `(date) => string`
 * - pass a `MetricDataSet` to use its `BinSize` in the maps above.
 * - or specify an explicit `BinSize` for the maps above.
 * If `showTimesAsRanges` is true, we'll draw the time as a range.
 */
export function getTooltipTimeFormatter(
  timeAxisFormatter: MetricDataSet | BinSize | TickFormatter = 'day',
  showTimesAsRanges = false
) {
  if (typeof timeAxisFormatter === 'function') return timeAxisFormatter
  const timeAxes = showTimesAsRanges ? TOOLTIP_RANGE_TIME_FORMATTERS : TOOLTIP_SINGLE_TIME_FORMATTERS
  if (timeAxisFormatter instanceof MetricDataSet) return timeAxes[timeAxisFormatter.binSize]
  return timeAxes[timeAxisFormatter]
}
