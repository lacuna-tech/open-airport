/**
 * <LacunaChup> with colors, title/subtitle, strikethrough
 */
import React from 'react'
import Chip, { ChipProps } from '@material-ui/core/Chip'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { amber, green } from '@material-ui/core/colors'

export interface LacunaChipProps extends Omit<ChipProps, 'color'> {
  /** Title, shown bold */
  title: string
  /** Subtitle, shown in lighter font */
  subtitle?: string
  /** Add additional colors. */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
  /** Set to true to strike through contents */
  strikeThrough?: boolean
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    margin: 2
  },
  strikeThrough: {
    textDecoration: 'line-through'
  },
  success: {
    backgroundColor: green[600],
    color: 'white'
  },
  info: {
    backgroundColor: theme.palette.secondary.dark,
    color: 'white'
  },
  warning: {
    backgroundColor: amber[700],
    color: 'white'
  },
  error: {
    backgroundColor: theme.palette.error.dark,
    color: 'white'
  }
}))

export default function LacunaChip(props: LacunaChipProps) {
  const classes = useStyles(props)
  const { title, subtitle, color, className = '', strikeThrough = false, style, ...otherProps } = props

  const chipProps: ChipProps = {
    size: 'small',
    style: {
      textDecoration: strikeThrough ? 'line-through' : 'none',
      ...style
    }
  }

  if (subtitle) {
    chipProps.label = (
      <>
        <strong>{title}</strong>&nbsp;{subtitle}
      </>
    )
  } else {
    chipProps.label = <strong>{title}</strong>
  }

  const chipClasses = [classes.chip]
  if (strikeThrough) chipClasses.push(classes.strikeThrough)
  if (color) {
    if (color === 'default' || color === 'primary' || color === 'secondary') chipProps.color = color
    else chipClasses.push(classes[color])
  }
  if (className) chipClasses.push(className)

  return <Chip className={chipClasses.join(' ')} {...chipProps} {...otherProps} />
}
