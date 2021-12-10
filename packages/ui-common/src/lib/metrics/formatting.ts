import { DateTime } from 'luxon'
import { currencyFormater, numberFormater, percentFormater } from '../../util'

export type MetricValueFormatterType = (value: number) => string | null

export const formatDuration: MetricValueFormatterType = value =>
  DateTime.fromMillis(value).toFormat(value >= 60000 ? "m'm':s's'" : "s's'")
export const formatCurrency: MetricValueFormatterType = value => currencyFormater.format(value)
export const formatPercent: MetricValueFormatterType = value => percentFormater.format(value)
export const formatNumber: MetricValueFormatterType = value => numberFormater.format(value)
