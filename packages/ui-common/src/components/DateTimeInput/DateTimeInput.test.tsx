import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'

import { DateTimeInput } from '.'

describe('when user enters an invalid date', () => {
  it('marks input as invalid', () => {
    render(<DateTimeInput id='test' label='date' />)

    const input = screen.getByRole('textbox', { name: /date/i })
    userEvent.type(input, '99')
    // Sanity check
    expect(input).toHaveValue('99/__/____')

    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays a helpful error message', () => {
    render(<DateTimeInput id='test' label='date' />)

    const input = screen.getByRole('textbox', { name: /date/i })
    userEvent.type(input, '99')
    // Sanity check
    expect(input).toHaveValue('99/__/____')

    expect(screen.getByText(/invalid/i)).toBeVisible()
  })

  it('does NOT call onChange', () => {
    const onChange = jest.fn<void, [DateTime]>()
    render(<DateTimeInput id='test' label='date' onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: /date/i })
    userEvent.type(input, '99')
    // Sanity check
    expect(input).toHaveValue('99/__/____')

    expect(onChange).not.toHaveBeenCalled()
  })
})

it('displays timezone abbreviation', () => {
  const onChange = jest.fn<void, [DateTime]>()
  render(<DateTimeInput id='test' label='Label' onChange={onChange} />)

  expect(screen.queryByText(/UTC/)).not.toBeNull()
})

it('displays DST-specific timezone abbrs when value is not null', () => {
  const onChange = jest.fn<void, [DateTime]>()
  const { rerender } = render(
    <DateTimeInput
      id='test'
      label='Label'
      value={DateTime.fromISO('2021-11-06')}
      timezone='America/Los_Angeles'
      onChange={onChange}
    />
  )

  expect(screen.queryByText(/PDT/)).not.toBeNull()

  rerender(
    <DateTimeInput
      id='test'
      label='Label'
      value={DateTime.fromISO('2021-11-08')}
      timezone='America/Los_Angeles'
      onChange={onChange}
    />
  )

  expect(screen.queryByText(/PST/)).not.toBeNull()
})

it('triggers onChange w/ time-stripped date', () => {
  const onChange = jest.fn<void, [DateTime]>()
  render(<DateTimeInput id='test' label='date' onChange={onChange} />)

  const input = screen.getByRole('textbox', { name: /date/i })
  userEvent.type(input, '01052021')
  // Sanity check
  expect(input).toHaveValue('01/05/2021')

  expect(onChange).toHaveBeenCalledTimes(1)
  const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
  expect(actual.toISO()).toEqual('2021-01-05T00:00:00.000+00:00')
})

describe('withTime', () => {
  it('triggers onChange w/ full datetime instant (minus seconds and milliseconds)', () => {
    const onChange = jest.fn<void, [DateTime]>()
    render(<DateTimeInput id='test' label='date' withTime onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: /date/i })
    userEvent.type(input, '0105202112:58p')
    // Sanity check
    expect(input).toHaveValue('01/05/2021 12:58 pm')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual.toISO()).toEqual('2021-01-05T12:58:00.000+00:00')
  })

  it('triggers onChange w/ timezone-adjusted date when timezone is provided', () => {
    const onChange = jest.fn<void, [DateTime]>()
    render(<DateTimeInput id='test' label='date' timezone='America/New_York' withTime onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: /date/i })
    userEvent.type(input, '0105202112:58p')
    // Sanity check
    expect(input).toHaveValue('01/05/2021 12:58 pm')

    expect(onChange).toHaveBeenCalledTimes(1)
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(actual.zoneName).toEqual('America/New_York')
  })
})

it('marks the input as invalid when error is present', () => {
  render(<DateTimeInput id='test' label='date' error />)

  expect(screen.getByRole('textbox', { name: /date/i })).toHaveAttribute('aria-invalid', 'true')
})

it('displays the passed helperText', () => {
  render(<DateTimeInput id='test' label='date' helperText='some text' />)

  expect(screen.getByText('some text')).toBeVisible()
})
