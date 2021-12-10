import React from 'react'
import { DateTime, Duration, Interval } from 'luxon'
import { Box, FormControlLabel, Switch, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { TimeRangeSelector } from '@lacuna/ui-common/src/components/Controls/TimeRangeSelector/TimeRangeSelector'
import { TimeRangePreset } from '@lacuna/ui-common/src/components/Controls/TimeRangeSelector/types'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  switchControl: {
    marginBottom: theme.spacing(1)
  }
}))

export type PickersOptions = {
  initialStartTime?: DateTime
  initialEndTime?: DateTime
  minuteStep?: number // step over minutes
  dateOnly?: boolean
  maxSelectablePeriod?: '24_hours' | '1_month'
}

export type FilterDateTimePickerProps = {
  value: Interval | TimeRangePreset | undefined
  onChange: (value: Interval | TimeRangePreset) => void
  onToggleLive?: (useLive: boolean) => void
  useLive?: boolean
  minDate?: DateTime
  maxDate?: DateTime
  maxDuration?: Duration
  wrapInput?: boolean
}

export const FilterDateTimePicker: React.FunctionComponent<FilterDateTimePickerProps> = ({
  value,
  onChange,
  onToggleLive,
  useLive,
  minDate,
  maxDate,
  maxDuration,
  wrapInput
}) => {
  const classes = useStyles()

  const handleUseRecentChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (onToggleLive !== undefined) {
      onToggleLive(checked)
    }
  }

  return (
    <Box className={classes.container}>
      {onToggleLive && (
        <FormControlLabel
          control={<Switch {...{ size: 'small', checked: useLive, onChange: handleUseRecentChange }} />}
          label={<Typography variant='body2'>Live</Typography>}
          className={classes.switchControl}
        />
      )}
      {!useLive && (
        <TimeRangeSelector
          label='Time Period'
          id='map.timeRange'
          value={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          maxDuration={maxDuration}
          wrapInput={wrapInput}
        />
      )}
    </Box>
  )
}
