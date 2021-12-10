import React from 'react'
import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core'
import { Jumbotron } from '../Jumbotron'
import { AuthenticationError } from '../../util/ResponseErrors'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(2)
    }
  })
)

export const AppErrorCodes = [
  'auth_failed_error',
  'config_load_error',
  'jurisdiction_load_error',
  'jurisdiction_not_found_error',
  'missing_permissions_error',
  'no_authorized_pages_error',
  'provider_load_error'
] as const
export type AppErrorCode = typeof AppErrorCodes[number]

export type AppErrorCases = {
  [key in AppErrorCode]: { condition: boolean; error: AuthenticationError | Error }
}

/**
 * Render error messages related to app initialization
 */
export interface AppInitErrorPageProps {
  errors: AppErrorCases
}

const ACCESS_DENIED = {
  title: 'Access Denied',
  message:
    'You don’t have permission to access this application. If you believe that you should have access, please contact your Lacuna representative.'
}

const DEFAULT = {
  title: 'Error initializing application',
  message:
    'Unfortunately, something went wrong.  Please try again shortly, and contact your Lacuna representative if this error continues to appear.'
}

export const AppInitErrorPage = ({ errors }: AppInitErrorPageProps) => {
  const classes = useStyles()
  const title = errors.auth_failed_error.condition ? ACCESS_DENIED.title : DEFAULT.title
  const message =
    errors.auth_failed_error.condition ||
    errors.missing_permissions_error.condition ||
    errors.no_authorized_pages_error.condition
      ? ACCESS_DENIED.message
      : DEFAULT.message
  const errorsToDisplay = errors.auth_failed_error.condition ? { auth_failed_error: errors.auth_failed_error } : errors
  return (
    <Jumbotron>
      <Typography variant='h5' className={classes.root}>
        <b>{title}</b>
      </Typography>
      <Typography variant='body1' className={classes.root}>
        {message}
      </Typography>
      <Typography variant='body2'>
        <b>Error messages:</b>
      </Typography>
      {Object.keys(errorsToDisplay).map(error => {
        if (errors[error as keyof AppErrorCases].condition) {
          return (
            <Typography variant='subtitle2' key={'error'}>
              {errors[error as keyof AppErrorCases].error.message}
            </Typography>
          )
        }
      })}
    </Jumbotron>
  )
}
