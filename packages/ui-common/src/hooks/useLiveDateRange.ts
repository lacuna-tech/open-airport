import React from 'react'
import { DateTime, Duration, Interval } from 'luxon'

export interface UseLiveDateRangeArgs {
  intervalSize: Duration
  updateFrequency: number
  defaultLiveMode?: boolean
  onTick?(value: Interval): void
}

export const useLiveDateRange = ({
  intervalSize,
  updateFrequency,
  defaultLiveMode = false,
  onTick
}: UseLiveDateRangeArgs) => {
  const [isLiveModeEnabled, setIsLiveModeEnabled] = React.useState<boolean>(defaultLiveMode)

  const onTickRef = React.useRef(onTick)
  React.useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  const tick = React.useCallback(() => {
    const now = DateTime.utc()
    const newLiveInterval = Interval.fromDateTimes(now.minus(intervalSize), now)
    onTickRef.current?.(newLiveInterval)
  }, [intervalSize])

  React.useEffect(() => {
    if (!isLiveModeEnabled) {
      return
    }

    tick()
    const handle = setInterval(() => {
      tick()
    }, updateFrequency)

    return () => {
      clearInterval(handle)
    }
  }, [isLiveModeEnabled, updateFrequency, tick])

  return {
    isLiveModeEnabled,
    enableLiveMode: React.useCallback(() => {
      setIsLiveModeEnabled(true)
    }, []),
    disableLiveMode: React.useCallback(() => {
      setIsLiveModeEnabled(false)
    }, []),
    toggleLiveMode: React.useCallback(() => {
      setIsLiveModeEnabled(enabled => !enabled)
    }, [])
  }
}
