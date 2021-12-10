import { renderHook, act } from '@testing-library/react-hooks'
import '@testing-library/jest-dom'
import { DateTime } from 'luxon'

import { formatDateRange } from './utils'
import { useDateRangeInput, DateRange } from '.'

describe('actions.updateStart()', () => {
  it('triggers onChange() w/ { start, end: null } when value is null', () => {
    const onChange = jest.fn<void, [DateRange]>()
    const { result } = renderHook(() => useDateRangeInput({ value: null, onChange }))

    act(() => {
      result.current.actions.updateStart(DateTime.fromISO('2021-01-05T00:00:00.000Z'))
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(formatDateRange(actual)).toEqual(
      formatDateRange({
        start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
        end: null
      })
    )
  })

  it('triggers onChange() w/ adjusted end when updated start date is after current end', () => {
    const onChange = jest.fn<void, [DateRange]>()
    const { result } = renderHook(() =>
      useDateRangeInput({
        value: {
          start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
          end: DateTime.fromISO('2021-01-08T23:59:59.999Z')
        },
        onChange
      })
    )

    act(() => {
      // Update start date to be AFTER end date, which would be an invalid range.
      result.current.actions.updateStart(DateTime.fromISO('2021-01-09T00:00:00.000Z'))
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(formatDateRange(actual)).toEqual(
      formatDateRange({
        start: DateTime.fromISO('2021-01-09T00:00:00.000Z'),
        end: DateTime.fromISO('2021-01-09T23:59:59.999Z')
      })
    )
  })

  describe('withTime', () => {
    it('triggers onChange() w/ full datetime instants in range', () => {
      const onChange = jest.fn<void, [DateRange]>()
      const { result } = renderHook(() =>
        useDateRangeInput({
          value: {
            start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
            end: DateTime.fromISO('2021-01-08T23:59:59.999Z')
          },

          withTime: true,
          onChange
        })
      )

      act(() => {
        // Update start date to be AFTER end date, which would be an invalid range.
        result.current.actions.updateStart(DateTime.fromISO('2021-01-05T12:59:00.000Z'))
      })

      expect(onChange).toHaveBeenCalledTimes(1)
      const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
      expect(formatDateRange(actual)).toEqual(
        formatDateRange({
          start: DateTime.fromISO('2021-01-05T12:59:00.000Z'),
          end: DateTime.fromISO('2021-01-08T23:59:59.999Z')
        })
      )
    })
  })
})

describe('actions.updateEnd()', () => {
  it('triggers onChange() w/ { start: null, end } when value is null', () => {
    const onChange = jest.fn<void, [DateRange]>()
    const { result } = renderHook(() => useDateRangeInput({ value: null, onChange }))

    act(() => {
      result.current.actions.updateEnd(DateTime.fromISO('2021-01-05T23:59:59.999Z'))
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(formatDateRange(actual)).toEqual(
      formatDateRange({
        start: null,
        end: DateTime.fromISO('2021-01-05T23:59:59.999Z')
      })
    )
  })

  it('triggers onChange() w/ adjusted start when updated end date is before current start', () => {
    const onChange = jest.fn<void, [DateRange]>()
    const { result } = renderHook(() =>
      useDateRangeInput({
        value: {
          start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
          end: DateTime.fromISO('2021-01-08T23:59:59.999Z')
        },
        onChange
      })
    )

    act(() => {
      // Update start date to be AFTER end date, which would be an invalid range.
      result.current.actions.updateEnd(DateTime.fromISO('2021-01-04T23:59:59.999Z'))
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(formatDateRange(actual)).toEqual(
      formatDateRange({
        start: DateTime.fromISO('2021-01-04T00:00:00.000Z'),
        end: DateTime.fromISO('2021-01-04T23:59:59.999Z')
      })
    )
  })

  describe('withTime', () => {
    it('triggers onChange() w/ full datetime instants in range', () => {
      const onChange = jest.fn<void, [DateRange]>()
      const { result } = renderHook(() =>
        useDateRangeInput({
          value: {
            start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
            end: DateTime.fromISO('2021-01-08T23:59:59.999Z')
          },

          withTime: true,
          onChange
        })
      )

      act(() => {
        // Update start date to be AFTER end date, which would be an invalid range.
        result.current.actions.updateEnd(DateTime.fromISO('2021-01-08T12:59:00.000Z'))
      })

      expect(onChange).toHaveBeenCalledTimes(1)
      const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
      expect(formatDateRange(actual)).toEqual(
        formatDateRange({
          start: DateTime.fromISO('2021-01-05T00:00:00.000Z'),
          end: DateTime.fromISO('2021-01-08T12:59:00.000Z')
        })
      )
    })
  })
})
