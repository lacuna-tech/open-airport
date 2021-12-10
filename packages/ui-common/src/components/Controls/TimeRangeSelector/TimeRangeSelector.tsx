import React from 'react'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { DateTime, Duration, Interval, Settings as DateTimeSettings } from 'luxon'

import { CustomTimeRangeDialog } from './CustomTimeRangeDialog'
import { TimeRangePreset } from './types'
import { isTimeRangePreset, timeRangePresetLabel } from './utils'

type SelectValue = 'custom' | TimeRangePreset
const DEFAULT_VALUE = TimeRangePreset.PAST_HOUR

const CUSTOM_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}

const useStyles = makeStyles(
  theme =>
    createStyles({
      root: {
        maxWidth: 290,
        minWidth: 150
      },
      label: {
        '&.Mui-focused': {
          color: theme.palette.type === 'light' ? theme.palette.primary.dark : theme.palette.common.white
        }
      },
      fittedSelectMenu: {
        whiteSpace: 'normal'
      }
    }),
  { name: 'TimeRangeSelector' }
)
export interface TimeRangeSelectorProps {
  id: string
  label?: string
  value?: Interval | TimeRangePreset
  timezone?: string
  liveIntervalSize?: Duration
  liveUpdateFrequency?: number
  onChange?: (value: Interval | TimeRangePreset) => void
  maxDuration?: Duration
  minDate?: DateTime
  maxDate?: DateTime
  timeRangePresets?: TimeRangePreset[]
  wrapInput?: boolean
}

export const TimeRangeSelector: React.FunctionComponent<TimeRangeSelectorProps> = ({
  id,
  label = 'Last Activity Within',
  value,
  timezone = DateTimeSettings.defaultZoneName,
  onChange,
  maxDuration,
  minDate,
  maxDate,
  wrapInput
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)
  const openDialog = React.useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const [selectedValue, setSelectedValue] = React.useState<SelectValue>(
    value instanceof Interval ? 'custom' : value ?? DEFAULT_VALUE
  )

  const [customDateRange, setCustomDateRange] = React.useState<Interval | null>(
    value instanceof Interval ? value : null
  )
  const useCustomDateRange = React.useCallback(
    (dateRange: Interval) => {
      setIsDialogOpen(false)
      setSelectedValue('custom')
      setCustomDateRange(dateRange)
      onChange?.(dateRange)
    },
    [onChange]
  )
  const cancelUseCustomDateRange = React.useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  const renderLabel = React.useCallback(
    value_ => {
      if (value_ === 'live') {
        return 'Live'
      }
      if (value_ === 'custom' && customDateRange != null) {
        const { start, end } = customDateRange
        return `${start.toLocaleString(CUSTOM_DATE_FORMAT)} - ${end.toLocaleString(CUSTOM_DATE_FORMAT)}`
      }
      if (isTimeRangePreset(value_)) {
        return timeRangePresetLabel(value_)
      }
      return 'Unknown'
    },
    [customDateRange]
  )

  const selectValue: React.ChangeEventHandler<{ name?: string; value: unknown }> = React.useCallback(
    event => {
      const { value: value_ } = event.target

      // Don't immediately update the select value to custom. Instead, update it to custom
      // after the user confirms their custom date selection in a dialog.
      if (value_ === 'custom') {
        return
      }

      if (isTimeRangePreset(value_)) {
        onChange?.(value_)
        setSelectedValue(value_)
      }
    },
    [onChange]
  )

  const classes = useStyles()
  const selectClasses = wrapInput ? { selectMenu: classes.fittedSelectMenu } : undefined
  return (
    <FormControl className={classes.root}>
      <InputLabel className={classes.label}>{label}</InputLabel>

      <Select
        id={id}
        autoWidth
        fullWidth
        value={selectedValue}
        disableUnderline
        renderValue={renderLabel}
        onChange={selectValue}
        classes={selectClasses}
      >
        {Object.values(TimeRangePreset).map(preset => (
          <MenuItem key={preset} value={preset}>
            {timeRangePresetLabel(preset)}
          </MenuItem>
        ))}

        <MenuItem value='custom' onClick={openDialog}>
          Custom
        </MenuItem>
      </Select>

      <CustomTimeRangeDialog
        id={`${id}__customTimeRange`}
        timezone={timezone}
        open={isDialogOpen}
        onConfirm={useCustomDateRange}
        onCancel={cancelUseCustomDateRange}
        maxDuration={maxDuration}
        minDate={minDate}
        maxDate={maxDate}
      />
    </FormControl>
  )
}
