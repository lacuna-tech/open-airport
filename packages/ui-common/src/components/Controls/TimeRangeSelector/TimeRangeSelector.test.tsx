import React from 'react'
import '@testing-library/jest-dom'
import { screen, render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Duration, Interval } from 'luxon'

import { TimeRangeSelector } from './TimeRangeSelector'
import { TimeRangePreset } from './types'

it('calls `onChange` w/ preset when a preset is selected', () => {
  const onChange = jest.fn<void, [Interval | TimeRangePreset]>()
  render(<TimeRangeSelector id='test' onChange={onChange} />)

  const select = screen.getByRole('button')
  userEvent.click(select)
  const listbox = screen.getByRole('listbox')
  const option = within(listbox).getByRole('option', { name: /past week/i })
  userEvent.click(option)

  const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
  expect(actual).toEqual(TimeRangePreset.PAST_WEEK)
})

it('calls `onChange` w/ custom interval when entered by user', () => {
  const onChange = jest.fn<void, [Interval | TimeRangePreset]>()
  render(<TimeRangeSelector id='test' onChange={onChange} />)

  // Select the custom option.
  const select = screen.getByRole('button')
  userEvent.click(select)
  const listbox = screen.getByRole('listbox')
  const option = within(listbox).getByRole('option', { name: /custom/i })
  userEvent.click(option)

  // Enter custom date in dialog.
  const dialog = screen.getByRole('dialog')
  const startDateInput = within(dialog).getByRole('textbox', { name: /start/i })
  userEvent.type(startDateInput, '03-24-2021 12:34p')
  const endDateInput = within(dialog).getByRole('textbox', { name: /end/i })
  userEvent.type(endDateInput, '03-28-2021 09:01a')
  const confirmButton = within(dialog).getByRole('button', { name: /confirm/i })
  userEvent.click(confirmButton)

  expect(onChange).toHaveBeenCalledTimes(1)
  const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
  expect((actual as Interval).toISO()).toEqual('2021-03-24T12:34:00.000+00:00/2021-03-28T09:01:00.000+00:00')
})

describe('when maxDuration is passed in', () => {
  it("doesn't allow the user to submit if duration exceeds maxDuration", () => {
    const onChange = jest.fn<void, [Interval | TimeRangePreset]>()
    render(<TimeRangeSelector id='test' maxDuration={Duration.fromObject({ days: 2 })} onChange={onChange} />)

    // Select the custom option.
    const select = screen.getByRole('button')
    userEvent.click(select)
    const listbox = screen.getByRole('listbox')
    const option = within(listbox).getByRole('option', { name: /custom/i })
    userEvent.click(option)

    // Enter custom date in dialog.
    const dialog = screen.getByRole('dialog')
    const startDateInput = within(dialog).getByRole('textbox', { name: /start/i })
    userEvent.type(startDateInput, '03-24-2021 12:34p')
    const endDateInput = within(dialog).getByRole('textbox', { name: /end/i })
    userEvent.type(endDateInput, '03-28-2021 09:01a')
    const confirmButton = within(dialog).getByRole('button', { name: /confirm/i })
    userEvent.click(confirmButton)

    expect(onChange).not.toHaveBeenCalled()
    expect(dialog).toBeVisible()
  })
})
