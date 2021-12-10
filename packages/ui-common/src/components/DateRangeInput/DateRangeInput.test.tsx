import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'

import { formatDateRange } from './utils'
import { DateRangeInput, DateRange } from '.'

describe('when user sets start date > end date', () => {
  it('calls onChange w/ end date = new start date', () => {
    const onChange = jest.fn() as jest.MockedFunction<(value: DateRange | null) => void>
    render(
      <DateRangeInput
        id='test'
        value={{ start: null, end: DateTime.fromISO('2021-01-05T23:59:59.999Z') }}
        onChange={onChange}
      />
    )

    const startInput = screen.getByRole('textbox', { name: /start/i })
    userEvent.clear(startInput)
    userEvent.type(startInput, '01072021')
    // Sanity check
    expect(startInput).toHaveValue('01/07/2021')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual).not.toBeNull()
    expect(formatDateRange(actual!)).toEqual(
      formatDateRange({
        start: DateTime.fromISO('2021-01-07T00:00:00.000Z'),
        end: DateTime.fromISO('2021-01-07T23:59:59.999Z')
      })
    )
  })
})

describe('when user sets end date < start date', () => {
  it('calls onChange w/ start date = new end date', () => {
    const onChange = jest.fn() as jest.MockedFunction<(value: DateRange | null) => void>
    render(
      <DateRangeInput
        id='test'
        value={{ start: DateTime.fromISO('2021-01-04T00:00:00.000Z'), end: null }}
        onChange={onChange}
      />
    )

    const endInput = screen.getByRole('textbox', { name: /end/i })
    userEvent.clear(endInput)
    userEvent.type(endInput, '01032021')
    // Sanity check
    expect(endInput).toHaveValue('01/03/2021')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual).not.toBeNull()
    expect(formatDateRange(actual!)).toEqual(
      formatDateRange({
        start: DateTime.fromISO('2021-01-03T00:00:00.000Z'),
        end: DateTime.fromISO('2021-01-03T23:59:59.999Z')
      })
    )
  })
})

describe('when withTime=false', () => {
  it('triggers onChange() w/ start date at start of day for timezone', () => {
    const onChange = jest.fn() as jest.MockedFunction<(value: DateRange | null) => void>
    render(<DateRangeInput id='test' value={null} onChange={onChange} />)

    const startInput = screen.getByRole('textbox', { name: /start/i })
    userEvent.type(startInput, '01032021')
    // Sanity check
    expect(startInput).toHaveValue('01/03/2021')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual).not.toBeNull()
    expect(formatDateRange(actual!)).toEqual(
      formatDateRange({
        start: DateTime.fromISO('2021-01-03T00:00:00.000Z'),
        end: null
      })
    )
  })

  it('triggers onChange() w/ end date at end of day for timezone', () => {
    const onChange = jest.fn() as jest.MockedFunction<(value: DateRange | null) => void>
    render(<DateRangeInput id='test' value={null} onChange={onChange} />)

    const endInput = screen.getByRole('textbox', { name: /end/i })
    userEvent.type(endInput, '01092021')
    // Sanity check
    expect(endInput).toHaveValue('01/09/2021')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual).not.toBeNull()
    expect(formatDateRange(actual!)).toEqual(
      formatDateRange({
        start: null,
        end: DateTime.fromISO('2021-01-09T23:59:59.999Z')
      })
    )
  })
})

describe('when withTime=true', () => {
  it('triggers onChange() w/ full datetime for start date', () => {
    const onChange = jest.fn() as jest.MockedFunction<(value: DateRange | null) => void>
    render(<DateRangeInput id='test' value={null} withTime onChange={onChange} />)

    const startInput = screen.getByRole('textbox', { name: /start/i })
    userEvent.clear(startInput)
    userEvent.type(startInput, '0103202101:55p')
    // Sanity check
    expect(startInput).toHaveValue('01/03/2021 01:55 pm')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual).not.toBeNull()
    expect(formatDateRange(actual!)).toEqual(
      formatDateRange({
        start: DateTime.fromISO('2021-01-03T13:55:00.000Z'),
        end: null
      })
    )
  })

  it('triggers onChange() w/ full datetime for end date', () => {
    const onChange = jest.fn() as jest.MockedFunction<(value: DateRange | null) => void>
    render(<DateRangeInput id='test' value={null} withTime onChange={onChange} />)

    const endInput = screen.getByRole('textbox', { name: /end/i })
    userEvent.clear(endInput)
    userEvent.type(endInput, '0109202110:32a')
    // Sanity check
    expect(endInput).toHaveValue('01/09/2021 10:32 am')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual).not.toBeNull()
    expect(formatDateRange(actual!)).toEqual(
      formatDateRange({
        start: null,
        end: DateTime.fromISO('2021-01-09T10:32:00.000Z')
      })
    )
  })
})

it('marks both inputs as invalid when error prop is true', () => {
  render(<DateRangeInput id='test' error />)

  expect(screen.getByRole('textbox', { name: /start/i })).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByRole('textbox', { name: /end/i })).toHaveAttribute('aria-invalid', 'true')
})

it('displays helperText', () => {
  render(<DateRangeInput id='test' helperText='some text' />)

  expect(screen.getByText('some text')).toBeVisible()
})
