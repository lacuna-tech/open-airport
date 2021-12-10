import { DateTime } from 'luxon'
import { roundDown } from './datetime'

describe('roundDown', () => {
  it('rounds an instant down to the nearest interval & zeros out less significant parts', () => {
    const actual = roundDown({ dateTime: DateTime.fromISO('2021-01-05T13:55:03.123Z'), quantity: 15, unit: 'minute' })
    expect(actual).toEqual(DateTime.fromISO('2021-01-05T13:45:00.000Z'))
  })
})
