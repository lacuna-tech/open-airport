import React from 'react'
import ArrowLeft from '@material-ui/icons/ArrowLeft'
import ArrowRight from '@material-ui/icons/ArrowRight'
import IconButton from '@material-ui/core/IconButton'
import Slider from '@material-ui/core/Slider'
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles'
import { DateTime, Duration, Interval } from 'luxon'

import { makeRange } from '../../util/array'
import * as datetimeUtils from '../../util/datetime'

const nearestIntervalMidpoint = (
  instant: DateTime,
  { min, max, step }: { min: DateTime; max: DateTime; step: Duration }
): DateTime => {
  const nearestMidpoint = datetimeUtils.roundDown({
    dateTime: instant,
    quantity: step.as('minutes'),
    unit: 'minute'
  })
  if (nearestMidpoint > max) {
    return max
  }
  if (nearestMidpoint < min) {
    return min
  }
  return nearestMidpoint
}

const Scrubber = withStyles(
  theme =>
    createStyles({
      valueLabel: {
        top: -24,
        whiteSpace: 'nowrap',
        fontWeight: 'bold',
        '& *': {
          background: 'transparent',
          color: theme.palette.text.primary
        }
      },
      rail: {
        color: theme.palette.text.primary
      },
      thumb: {
        color: theme.palette.text.primary
      },
      markLabel: {
        color: theme.palette.text.primary,
        marginTop: theme.spacing(1),
        fontSize: theme.typography.pxToRem(10)
      },
      marked: {
        marginBottom: 0
      }
    }),
  { name: 'Scrubber' }
)(Slider)

const DATETIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  day: '2-digit'
}

const useStyles = makeStyles(
  theme =>
    createStyles({
      root: {
        width: '100%',
        padding: theme.spacing(4, 4),
        display: 'flex',
        alignItems: 'center'
      },
      scrubber: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: theme.spacing(0, 2)
      },
      control: {
        color: theme.palette.text.primary
      }
    }),
  { name: 'TimeScrubber' }
)

export interface TimeScrubberProps {
  min: DateTime
  max: DateTime
  step: Duration
  defaultValue?: DateTime
  disabled?: boolean
  onChange?: (interval: Interval) => void
}

export const TimeScrubber: React.FunctionComponent<TimeScrubberProps> = ({
  min: min_,
  max: max_,
  step,
  disabled,
  defaultValue,
  onChange
}) => {
  const halfStep = step.toMillis() / 2
  const min = datetimeUtils.roundDown({ dateTime: min_, quantity: step.as('minutes'), unit: 'minute' })
  const max = datetimeUtils.roundDown({ dateTime: max_, quantity: step.as('minutes'), unit: 'minute' })
  const range = max.diff(min)
  const segmentSize = range.toMillis() / 3
  const marks = makeRange(4).map(i => {
    const mark = datetimeUtils.roundDown({
      dateTime: min.plus(i * segmentSize),
      quantity: step.as('minutes'),
      unit: 'minute'
    })
    return {
      value: mark.toMillis(),
      label: mark.toLocaleString(DATETIME_FORMAT)
    }
  })
  const scrubberRef = React.useRef<HTMLElement | null>(null)
  const dispatchKeydownEvent = (key: string, code: string): void => {
    // KLUDGE: we're manually simulating a keydown event on the slider element here because
    //         MUI's Slider doesn't expose any uncontrolled API for changing the slider
    //         position, and the controlled UX is pretty terrible (the slider doesn't move
    //         while dragged). This is fragile and prone to breakage since it reaches into
    //         the internals of Slider AND the internal event handling of React.
    if (!scrubberRef.current) {
      return
    }
    const slider = scrubberRef.current.querySelector<HTMLElement>('[role=slider]')
    if (!slider) {
      return
    }
    slider.dispatchEvent(
      new KeyboardEvent('keydown', {
        // React only triggers event handlers due to synthetic events, which are generated
        // by a global event handler that catches unhandled native events and dispatches a
        // corresponding synthetic event back to the element that created the native event.
        // Thus our native events have to bubble up to the window in order to be properly
        // caught and handled by React.
        bubbles: true,
        cancelable: false,
        key,
        code
      })
    )
    // Focus the slider so that we can use keyboard controls after pressing the
    // increment/decrement button.
    slider.focus()
  }
  const increment = () => {
    dispatchKeydownEvent('ArrowRight', 'ArrowRight')
  }
  const decrement = () => {
    dispatchKeydownEvent('ArrowLeft', 'ArrowLeft')
  }

  const classes = useStyles()
  return (
    <div className={classes.root}>
      <IconButton
        aria-label='decrement'
        className={classes.control}
        disableFocusRipple
        size='small'
        edge='start'
        onClick={decrement}
      >
        <ArrowLeft />
      </IconButton>
      <div className={classes.scrubber}>
        <Scrubber
          ref={scrubberRef}
          defaultValue={defaultValue ? nearestIntervalMidpoint(defaultValue, { min, max, step }).toMillis() : undefined}
          step={step.toMillis()}
          min={min.toMillis()}
          max={max.toMillis()}
          marks={marks}
          track={false}
          valueLabelFormat={timestamp =>
            Number.isNaN(timestamp) ? '-' : DateTime.fromMillis(timestamp).toLocaleString(DATETIME_FORMAT)
          }
          valueLabelDisplay='on'
          disabled={disabled}
          onChangeCommitted={(_event, timestamp) => {
            const midpoint = DateTime.fromMillis(timestamp as number)
            onChange?.(Interval.fromDateTimes(midpoint.minus(halfStep), midpoint.plus(halfStep)))
          }}
        />
      </div>
      <IconButton
        aria-label='increment'
        className={classes.control}
        disableFocusRipple
        size='small'
        edge='end'
        onClick={increment}
      >
        <ArrowRight />
      </IconButton>
    </div>
  )
}
