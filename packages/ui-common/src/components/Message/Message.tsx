/**
 * Success/error/etc colored message display.
 * Based on inline snackbar from:  https://material-ui.com/components/snackbars/#customized-snackbars
 */
import * as React from 'react'
import { SnackbarContent, Typography } from '@material-ui/core'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { amber, green } from '@material-ui/core/colors'

import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import SuccessIcon from '@material-ui/icons/CheckCircle'
import WarningIcon from '@material-ui/icons/Warning'

const variantIcon = {
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
}

const useStyles = makeStyles((theme: Theme) => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.secondary.dark
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 30
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'top'
  },
  description: {
    display: 'block'
  }
}))

export interface MessageProps {
  /** Variant as one of `info`, `success`, `error`, `warning` */
  variant: keyof typeof variantIcon
  /** Main message to display. */
  message: string
  /** Additional description, shown in smaller text. */
  description?: string
  /** Additional CSS class as you like. */
  className?: string
  /** CSS margin value */
  margin?: number | string
}

export default function Message(props: MessageProps) {
  const classes = useStyles(props)
  const { variant, message, description, className, margin = '20px 0', ...other } = props
  const variantClass = classes[variant]
  const Icon = variantIcon[variant]

  return (
    <SnackbarContent
      className={`${variantClass} ${className}`}
      style={{ margin }}
      message={
        <span className={classes.message}>
          <Icon className={`${classes.icon} ${classes.iconVariant}`} />
          <div>
            <Typography variant='h6'>{message}</Typography>
            {!!description && <Typography variant='body1'>{description}</Typography>}
          </div>
        </span>
      }
      {...other}
    />
  )
}
