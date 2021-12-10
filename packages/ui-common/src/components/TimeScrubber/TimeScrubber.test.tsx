import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime, Duration, Interval, Settings as DateTimeSettings } from 'luxon'

import { TimeScrubber } from './TimeScrubber'

let originalTimezoneName: string
beforeEach(() => {
  originalTimezoneName = DateTimeSettings.defaultZoneName
  DateTimeSettings.defaultZoneName = 'UTC'
})
afterEach(() => {
  DateTimeSettings.defaultZoneName = originalTimezoneName
})

it('starts at specified defaultValue when defaultValue aligned w/ step window', () => {
  render(
    <TimeScrubber
      min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
      max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
      step={Duration.fromObject({ minutes: 5 })}
      defaultValue={DateTime.fromISO('2021-01-05T15:45:00.000Z')}
    />
  )

  expect(screen.getByRole('slider')).toHaveAttribute(
    'aria-valuenow',
    DateTime.fromISO('2021-01-05T15:45:00.000Z').toMillis().toString()
  )
})

it('starts at rounded value when defaultValue NOT aligned w/ step window', () => {
  render(
    <TimeScrubber
      min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
      max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
      step={Duration.fromObject({ minutes: 5 })}
      defaultValue={DateTime.fromISO('2021-01-05T15:47:00.000Z')}
    />
  )

  expect(screen.getByRole('slider')).toHaveAttribute(
    'aria-valuenow',
    DateTime.fromISO('2021-01-05T15:45:00.000Z').toMillis().toString()
  )
})

it('starts at max value when defaultValue > max', () => {
  render(
    <TimeScrubber
      min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
      max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
      step={Duration.fromObject({ minutes: 5 })}
      defaultValue={DateTime.fromISO('2021-01-05T19:21:00.123Z')}
    />
  )

  expect(screen.getByRole('slider')).toHaveAttribute(
    'aria-valuenow',
    DateTime.fromISO('2021-01-05T19:00:00.000Z').toMillis().toString()
  )
})

it('starts at min value when defaultValue < min', () => {
  render(
    <TimeScrubber
      min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
      max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
      step={Duration.fromObject({ minutes: 5 })}
      defaultValue={DateTime.fromISO('2021-01-05T14:46:01.123Z')}
    />
  )

  expect(screen.getByRole('slider')).toHaveAttribute(
    'aria-valuenow',
    DateTime.fromISO('2021-01-05T15:00:00.000Z').toMillis().toString()
  )
})

describe('keyboard controls', () => {
  it('calls onChange w/ previous interval on keyboard left', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T15:45:00.000Z')}
        onChange={onChange}
      />
    )

    // NOTE: we have to use fireEvent here instead of userEvent.keyboard because the MUI
    //       Slider component doesn't take focus traditionally, and doesn't play nice with
    //       JSDOM.
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft', code: 'ArrowLeft' })

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T15:37:30.000Z/2021-01-05T15:42:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })

  it('calls onChange w/ min interval on keyboard left when already at min value', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        onChange={onChange}
      />
    )

    // NOTE: we have to use fireEvent here instead of userEvent.keyboard because the MUI
    //       Slider component doesn't take focus traditionally, and doesn't play nice with
    //       JSDOM.
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft', code: 'ArrowLeft' })

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T14:57:30.000Z/2021-01-05T15:02:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })

  it('calls onChange w/ next interval on keyboard right', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T15:45:00.000Z')}
        onChange={onChange}
      />
    )

    // NOTE: we have to use fireEvent here instead of userEvent.keyboard because the MUI
    //       Slider component doesn't take focus traditionally, and doesn't play nice with
    //       JSDOM.
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T15:47:30.000Z/2021-01-05T15:52:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })

  it('calls onChange w/ max interval on keyboard right when already at max value', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        onChange={onChange}
      />
    )

    // NOTE: we have to use fireEvent here instead of userEvent.keyboard because the MUI
    //       Slider component doesn't take focus traditionally, and doesn't play nice with
    //       JSDOM.
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T18:57:30.000Z/2021-01-05T19:02:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })
})

describe('increment/decrement controls', () => {
  it('calls onChange w/ previous interval on decrement button press', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T15:45:00.000Z')}
        onChange={onChange}
      />
    )

    userEvent.click(screen.getByRole('button', { name: /decrement/ }))

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T15:37:30.000Z/2021-01-05T15:42:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })

  it('calls onChange w/ min interval on decrement button press when already at min value', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        onChange={onChange}
      />
    )

    userEvent.click(screen.getByRole('button', { name: /decrement/ }))

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T14:57:30.000Z/2021-01-05T15:02:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })

  it('calls onChange w/ next interval on increment button press', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T15:45:00.000Z')}
        onChange={onChange}
      />
    )

    userEvent.click(screen.getByRole('button', { name: /increment/ }))

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T15:47:30.000Z/2021-01-05T15:52:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })

  it('calls onChange w/ max interval on increment button press when already at max value', () => {
    const onChange = jest.fn<void, [Interval]>()
    render(
      <TimeScrubber
        min={DateTime.fromISO('2021-01-05T15:00:00.000Z')}
        max={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        step={Duration.fromObject({ minutes: 5 })}
        defaultValue={DateTime.fromISO('2021-01-05T19:00:00.000Z')}
        onChange={onChange}
      />
    )

    userEvent.click(screen.getByRole('button', { name: /increment/ }))

    expect(onChange).toHaveBeenCalled()
    const [actual] = onChange.mock.calls[onChange.mock.calls.length - 1]
    const expected = Interval.fromISO('2021-01-05T18:57:30.000Z/2021-01-05T19:02:30.000Z')
    expect(actual.toISO()).toEqual(expected.toISO())
  })
})
