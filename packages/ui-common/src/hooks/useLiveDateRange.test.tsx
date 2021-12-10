import { act, renderHook } from '@testing-library/react-hooks'
import { DateTime, Duration, Interval } from 'luxon'
import MockDate from 'mockdate'

import { useLiveDateRange } from './useLiveDateRange'

const advanceTimeBy = (duration: Duration) =>
  act(() => {
    const now = DateTime.now()
    MockDate.set(now.plus(duration).toISO())
    jest.advanceTimersByTime(duration.toMillis())
  })

afterEach(() => {
  MockDate.reset()
  jest.useRealTimers()
})

describe('when in live mode', () => {
  it('calls onTick w/ new time interval regularly at specified frequency', () => {
    jest.useFakeTimers()
    MockDate.set('2021-01-05T13:52:32.021Z')

    const onTick = jest.fn<void, [Interval]>()
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000, onTick })
    )

    advanceTimeBy(Duration.fromMillis(15_000))
    advanceTimeBy(Duration.fromMillis(15_000))

    expect(onTick).toHaveBeenCalledTimes(3)
    const actual = onTick.mock.calls.slice(1).map(args => args[0].toISO())
    expect(actual).toEqual([
      '2021-01-05T13:37:47.021Z/2021-01-05T13:52:47.021Z',
      '2021-01-05T13:38:02.021Z/2021-01-05T13:53:02.021Z'
    ])
  })

  it('does NOT call onTick after calling disableLiveMode()', () => {
    jest.useFakeTimers()
    MockDate.set('2021-01-05T13:52:32.021Z')

    const onTick = jest.fn<void, [Interval]>()
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000, onTick })
    )

    act(() => {
      result.current.disableLiveMode()
    })
    advanceTimeBy(Duration.fromMillis(15_000))
    advanceTimeBy(Duration.fromMillis(15_000))

    expect(onTick).toHaveBeenCalledTimes(1)
  })
})

describe('when NOT in live mode', () => {
  it('does NOT call onTick', () => {
    jest.useFakeTimers()
    MockDate.set('2021-01-05T13:52:32.021Z')

    const onTick = jest.fn<void, [Interval]>()
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    renderHook(() =>
      useLiveDateRange({ defaultLiveMode: false, intervalSize: liveIntervalSize, updateFrequency: 15_000, onTick })
    )

    advanceTimeBy(Duration.fromMillis(15_000))
    advanceTimeBy(Duration.fromMillis(15_000))

    expect(onTick).not.toHaveBeenCalled()
  })

  it('calls onTick w/ new time interval immediately after calling enableLiveMode', () => {
    jest.useFakeTimers()
    MockDate.set('2021-01-05T13:52:32.021Z')

    const onTick = jest.fn<void, [Interval]>()
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000, onTick })
    )

    act(() => {
      result.current.enableLiveMode()
    })

    expect(onTick).toHaveBeenCalledTimes(1)
    const [actual] = onTick.mock.calls[onTick.mock.calls.length - 1]
    expect(actual.toISO()).toEqual('2021-01-05T13:37:32.021Z/2021-01-05T13:52:32.021Z')
  })

  it('calls onTick w/ new time interval regularly at specified frequency after calling enableLiveMode', () => {
    jest.useFakeTimers()
    MockDate.set('2021-01-05T13:52:32.021Z')

    const onTick = jest.fn<void, [Interval]>()
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000, onTick })
    )

    act(() => {
      result.current.enableLiveMode()
    })
    advanceTimeBy(Duration.fromMillis(15_000))
    advanceTimeBy(Duration.fromMillis(15_000))

    expect(onTick).toHaveBeenCalledTimes(3)
    const actual = onTick.mock.calls.slice(1).map(args => args[0].toISO())
    expect(actual).toEqual([
      '2021-01-05T13:37:47.021Z/2021-01-05T13:52:47.021Z',
      '2021-01-05T13:38:02.021Z/2021-01-05T13:53:02.021Z'
    ])
  })
})

describe('when defaultLiveMode = true', () => {
  it('starts in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    expect(result.current.isLiveModeEnabled).toEqual(true)
  })

  it('immediately calls onTick w/ current time interval', () => {
    jest.useFakeTimers()
    MockDate.set('2021-01-05T13:52:32.021Z')

    const onTick = jest.fn<void, [Interval]>()
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000, onTick })
    )

    expect(onTick).toHaveBeenCalledTimes(1)
    const [actual] = onTick.mock.calls[onTick.mock.calls.length - 1]
    expect(actual.toISO()).toEqual('2021-01-05T13:37:32.021Z/2021-01-05T13:52:32.021Z')
  })
})

describe('when defaultLiveMode = false', () => {
  it('does NOT start in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: false, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    expect(result.current.isLiveModeEnabled).toEqual(false)
  })

  it('does NOT call onTick', () => {
    jest.useFakeTimers()
    MockDate.set('2021-01-05T13:52:32.021Z')

    const onTick = jest.fn<void, [Interval]>()
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    renderHook(() =>
      useLiveDateRange({ defaultLiveMode: false, intervalSize: liveIntervalSize, updateFrequency: 15_000, onTick })
    )

    advanceTimeBy(Duration.fromMillis(15_000))
    advanceTimeBy(Duration.fromMillis(15_000))

    expect(onTick).not.toHaveBeenCalled()
  })
})

describe('enableLiveMode()', () => {
  it('turns live mode ON when NOT in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: false, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    act(() => {
      result.current.enableLiveMode()
    })

    expect(result.current.isLiveModeEnabled).toEqual(true)
  })

  it('keeps live mode ON when already in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    act(() => {
      result.current.enableLiveMode()
    })

    expect(result.current.isLiveModeEnabled).toEqual(true)
  })
})

describe('disableLiveMode()', () => {
  it('turns live mode OFF when in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    act(() => {
      result.current.disableLiveMode()
    })

    expect(result.current.isLiveModeEnabled).toEqual(false)
  })

  it('keeps live mode OFF when already NOT in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: false, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    act(() => {
      result.current.disableLiveMode()
    })

    expect(result.current.isLiveModeEnabled).toEqual(false)
  })
})

describe('toggleLiveMode()', () => {
  it('turns live mode OFF when started in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: true, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    act(() => {
      result.current.toggleLiveMode()
    })

    expect(result.current.isLiveModeEnabled).toEqual(false)
  })

  it('turns live mode ON when NOT started in live mode', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: false, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    act(() => {
      result.current.toggleLiveMode()
    })

    expect(result.current.isLiveModeEnabled).toEqual(true)
  })

  it('goes back to original state when called twice', () => {
    const liveIntervalSize = Duration.fromObject({ minutes: 15 })
    const { result } = renderHook(() =>
      useLiveDateRange({ defaultLiveMode: false, intervalSize: liveIntervalSize, updateFrequency: 15_000 })
    )

    act(() => {
      result.current.toggleLiveMode()
    })
    act(() => {
      result.current.toggleLiveMode()
    })

    expect(result.current.isLiveModeEnabled).toEqual(false)
  })
})
