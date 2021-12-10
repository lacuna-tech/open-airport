import React from 'react'
import { makeStyles, FormControlLabel, Switch, Typography } from '@material-ui/core'
import { DateTime, Duration } from 'luxon'

import { useLiveDateRange } from '../../../hooks/useLiveDateRange'

import Spring from '../../Spring/Spring'

import { FilterCard, FilterCardTitle } from '../../FilterCard'
import { DateRangeInput, DateRange } from '../../DateRangeInput'

const useStyles = makeStyles(
  {
    header: {
      flex: 1,
      display: 'flex',
      alignItems: 'center'
    },
    liveToggle: {
      justifySelf: 'flex-end'
    }
  },
  {
    name: 'LiveDateRangeFilterCard'
  }
)

export interface LiveDateRangeFilterCardProps {
  id: string
  icon?: React.ReactNode
  name?: string
  value?: DateRange | null
  disabled?: boolean
  timezone?: string
  liveIntervalSize?: Duration
  liveUpdateFrequency?: number
  withTime?: boolean
  withLive?: boolean
  minDate?: DateTime
  maxDate?: DateTime
  onChange?: (value: DateRange | null) => void
}

const DEFAULT_LIVE_INTERVAL_SIZE = Duration.fromObject({ minutes: 15 })
const DEFAULT_LIVE_UPDATE_FREQUENCY = 15_000

export const LiveDateRangeFilterCard: React.FunctionComponent<LiveDateRangeFilterCardProps> = ({
  id,
  icon,
  name,
  value = null,
  disabled,
  timezone,
  liveIntervalSize = DEFAULT_LIVE_INTERVAL_SIZE,
  liveUpdateFrequency = DEFAULT_LIVE_UPDATE_FREQUENCY,
  withTime,
  withLive,
  minDate,
  maxDate,
  onChange
}) => {
  const { isLiveModeEnabled, toggleLiveMode: toggleLiveMode_ } = useLiveDateRange({
    intervalSize: liveIntervalSize,
    updateFrequency: liveUpdateFrequency,
    onTick: React.useCallback(
      ({ start, end }) => {
        // Intervals are technically compatible with the DateRange interface,
        // but for consistency we're stripping the parts of Interval that aren't
        // in the DateRange interface.
        const dateRange = { start, end }
        onChange?.(dateRange)
      },
      [onChange]
    )
  })

  // Store the manually entered date range on live mode toggle so that we can
  // revert back to it when live mode is disabled again.
  const lastDateRangeRef = React.useRef<typeof value>(value)
  const toggleLiveMode = React.useCallback(() => {
    if (isLiveModeEnabled) {
      onChange?.(lastDateRangeRef.current)
    } else {
      lastDateRangeRef.current = value
    }
    toggleLiveMode_()
  }, [isLiveModeEnabled, onChange, value, toggleLiveMode_])

  const classes = useStyles()
  return (
    <FilterCard
      icon={icon}
      header={
        <div className={classes.header}>
          <FilterCardTitle>Time Range</FilterCardTitle>
          <Spring />
          {withLive != null && (
            <FormControlLabel
              id={`${id}_liveToggle`}
              name={name ? `${name}.live` : undefined}
              control={<Switch size='small' />}
              labelPlacement='start'
              label={<Typography variant='body2'>Live</Typography>}
              className={classes.liveToggle}
              disabled={disabled}
              checked={isLiveModeEnabled}
              onChange={toggleLiveMode}
            />
          )}
        </div>
      }
    >
      <DateRangeInput
        id={id}
        name={name}
        value={value}
        disabled={disabled || isLiveModeEnabled}
        timezone={timezone}
        withTime={withTime || isLiveModeEnabled}
        minDate={minDate}
        maxDate={maxDate}
        onChange={onChange}
      />
    </FilterCard>
  )
}
