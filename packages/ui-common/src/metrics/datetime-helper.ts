import { DateTime, DurationUnit } from 'luxon'
// eslint-disable-next-line import/no-cycle
import { BinSize } from '.'

export type TemporalDirection = 'left' | 'right'

export const nextBinSizeUp = ({ bin_size }: { bin_size: BinSize }) => {
  if (bin_size === 'year') {
    return bin_size
  }
  return {
    hour: 'day',
    day: 'month',
    month: 'year'
  }[bin_size] as BinSize
}

export const binSizeToDateTimeMap: { [key in BinSize]: DurationUnit } = {
  hour: 'hour',
  day: 'day',
  month: 'month',
  year: 'year'
}
export const binSizeToDateTimeDurationMap: { [key in BinSize]: DurationUnit } = {
  hour: 'hour',
  day: 'day',
  month: 'month',
  year: 'year'
}

export const translateTimeToKeyByBinSize = ({ start_time, bin_size }: { start_time: number; bin_size: BinSize }) => {
  const time = DateTime.fromMillis(start_time)
  return {
    hour: () => time.toFormat('H-d-L-yyyy'),
    day: () => time.toFormat('d-L-yyyy'),
    month: () => time.toFormat('L-yyyy'),
    year: () => time.toFormat('yyyy')
  }[bin_size]()
}

export const startOf = ({
  time,
  bin_size,
  forNextBinSizeUp
}: {
  time: number
  bin_size: BinSize
  forNextBinSizeUp: boolean
}) =>
  DateTime.fromMillis(time)
    .startOf(binSizeToDateTimeMap[forNextBinSizeUp ? nextBinSizeUp({ bin_size }) : bin_size])
    .valueOf()

export const endOf = ({
  time,
  bin_size,
  forNextBinSizeUp
}: {
  time: number
  bin_size: BinSize
  forNextBinSizeUp: boolean
}) =>
  DateTime.fromMillis(time)
    .endOf(binSizeToDateTimeMap[forNextBinSizeUp ? nextBinSizeUp({ bin_size }) : bin_size])
    .valueOf()

export const startEndOf = ({
  time,
  bin_size,
  forNextBinSizeUp
}: {
  time: number
  bin_size: BinSize
  forNextBinSizeUp: boolean
}) => {
  const start = startOf({ time, bin_size, forNextBinSizeUp })
  const end = endOf({ time: start, bin_size, forNextBinSizeUp })
  return [start, end]
}

export const navigateThroughTime = ({
  date,
  direction,
  bin_size
}: {
  date: number
  direction: TemporalDirection
  bin_size: BinSize
}) => {
  const directionalValue = direction === 'left' ? -1 : 1
  const unit = binSizeToDateTimeDurationMap[nextBinSizeUp({ bin_size })]
  return DateTime.fromMillis(date)
    .plus({ [unit]: directionalValue })
    .valueOf()
}

export const clampDate = ({
  date,
  newDate,
  minDate,
  maxDate
}: {
  date: number
  newDate: number
  minDate: number
  maxDate: number
}) => {
  return newDate > maxDate || newDate < minDate ? date : newDate
}
