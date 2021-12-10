import { TIME_COMPARATOR_TYPE } from 'components'
import { DateTime } from 'luxon'

export const getDataLabel = (time: TIME_COMPARATOR_TYPE) => {
  const sameDayLastWeekText = DateTime.now().minus({ week: 1 }).toFormat('cccc LLLL d')
  const hourText = `${DateTime.now().startOf('hour').toFormat('h')}-${DateTime.now().plus({ hour: 1 }).toFormat('ha')}`
  const currenHourText = `Today ${hourText}`
  const yesterdayHourText = `Yesterday ${hourText}`
  switch (time) {
    case 'today_yesterday':
      return { first: 'Yesterday', second: 'Today' }
    case 'today_last_week':
      return { first: sameDayLastWeekText, second: 'Today' }
    case 'hour_last_week':
      return { first: yesterdayHourText, second: currenHourText }
    default:
      return { first: '-', second: '-' }
  }
}
