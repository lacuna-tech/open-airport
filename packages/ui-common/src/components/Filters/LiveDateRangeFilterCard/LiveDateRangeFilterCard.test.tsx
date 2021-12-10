import React from 'react'
import '@testing-library/jest-dom'
import MockDate from 'mockdate'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime, Duration } from 'luxon'

import { DateRange, formatDateRange } from '../../DateRangeInput'

import { LiveDateRangeFilterCard, LiveDateRangeFilterCardProps } from '.'

const ControlledLiveDateRangeFilterCard = ({
  value: initialValue,
  onChange,
  ...props
}: LiveDateRangeFilterCardProps) => {
  const [value, setValue] = React.useState(initialValue)
  const updateValue = React.useCallback(
    (newValue: DateRange | null) => {
      setValue(newValue)
      onChange?.(newValue)
    },
    [onChange]
  )
  return <LiveDateRangeFilterCard onChange={updateValue} value={value} {...props} />
}

afterEach(() => {
  MockDate.reset()
  jest.useRealTimers()
})

it('triggers onChange() w/ current live interval when user activates live mode', () => {
  // Mock the current datetime so we get predictable behavior.
  MockDate.set('2021-01-05T13:52:32.021Z')

  const onChange = jest.fn<void, [DateRange | null]>()
  render(
    <LiveDateRangeFilterCard
      id='test'
      withLive
      liveIntervalSize={Duration.fromObject({ minutes: 15 })}
      onChange={onChange}
    />
  )

  const liveToggle = screen.getByRole('checkbox', { name: /live/i })
  userEvent.click(liveToggle)

  expect(onChange).toHaveBeenCalledTimes(1)
  const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
  expect(formatDateRange(actual!)).toEqual(
    formatDateRange({
      start: DateTime.fromISO('2021-01-05T13:37:32.021Z'),
      end: DateTime.fromISO('2021-01-05T13:52:32.021Z')
    })
  )
})

it('triggers onChange() every x ms when in live mode w/ current live interval', () => {
  // Mock the current datetime so we get predictable behavior.
  MockDate.set('2021-01-05T13:59:32.021Z')
  // We're relying on setTimeout to trigger a state update, so we have to mock out
  // native timers.
  jest.useFakeTimers()

  const onChange = jest.fn<void, [DateRange | null]>()
  render(
    <LiveDateRangeFilterCard
      id='test'
      withLive
      liveIntervalSize={Duration.fromObject({ minutes: 15 })}
      liveUpdateFrequency={5_000}
      onChange={onChange}
    />
  )

  const liveToggle = screen.getByRole('checkbox', { name: /live/i })
  userEvent.click(liveToggle)
  // Sanity check
  expect(onChange).toHaveBeenCalledTimes(1)

  // Advance the current date time by 5s and run faked timers to see if our component currently
  // triggers onChange with the same live period.
  // Running the timers triggers a state update in react, so we have to wrap in act()
  // to ensure that @testing-library/react correctly updates internal state.
  act(() => {
    MockDate.set('2021-01-05T13:59:37.123Z')
    jest.advanceTimersByTime(5_000)
  })
  act(() => {
    // Advance and trigger fake timers another 5s.
    MockDate.set('2021-01-05T13:59:42.123Z')
    jest.advanceTimersByTime(5_000)
  })

  // Should trigger 3 times - once when live mode is toggled, twice for the 5s autoupdate.
  expect(onChange).toHaveBeenCalledTimes(3)
  const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
  expect(formatDateRange(actual!)).toEqual(
    // Should have called onChange with the next 15-minute period after our initial period.
    formatDateRange({
      start: DateTime.fromISO('2021-01-05T13:44:42.123Z'),
      end: DateTime.fromISO('2021-01-05T13:59:42.123Z')
    })
  )
})

it('triggers onChange() w/ last valid date range when user deactivates live mode', () => {
  const onChange = jest.fn<void, [DateRange | null]>()
  render(
    <ControlledLiveDateRangeFilterCard
      id='test'
      onChange={onChange}
      value={{
        start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
        end: DateTime.fromISO('2021-01-08T23:59:59.999Z')
      }}
      withLive
      liveIntervalSize={Duration.fromObject({ minutes: 15 })}
    />
  )

  const liveToggle = screen.getByRole('checkbox', { name: /live/i })
  userEvent.click(liveToggle)
  userEvent.click(liveToggle)

  expect(onChange).toHaveBeenCalledTimes(2)
  const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
  expect(formatDateRange(actual!)).toEqual(
    formatDateRange({
      start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
      end: DateTime.fromISO('2021-01-08T23:59:59.999Z')
    })
  )
})
