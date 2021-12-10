import React from 'react'
import { Box, Button } from '@material-ui/core'
import { useBoundAction } from '../../util/store_utils'
import { auth } from '../../store'
import { AuthenticationError } from '../../util/ResponseErrors'
import { Jumbotron } from '../Jumbotron'

// Defaults for normal Errors.
const NORMAL_ERROR_DEFAULTS = {
  title: 'An error occurred',
  text:
    'Unfortunately, something went wrong.  Please try again shortly, and contact your Lacuna representative if this error continues to appear.',
  action: undefined
}

// Defaults for AuthenticaionErrors.
const AUTH_ERROR_DEFAULTS = (actionOnClick: () => void) => ({
  title: 'Access denied',
  text:
    'You don’t have permission to access this page. If you believe that you should have access, please contact your Lacuna representative.',
  action: (
    <Button variant='outlined' onClick={actionOnClick}>
      Logout
    </Button>
  )
})

export interface ErrorPageProps {
  /** Actual error object. */
  error?: Error
  /** Page title.  Default is according to error type. */
  title?: string
  /** Main page text to display.  Default is according to error type.
   *
   * NOTE: Returns (`\n`) in text will be split into multiple paragraphs,
   *       but you MUST wrapp `text` in curly braces, like so:
   *       `<ErrorPage text={'Line 1\nLine 2'}/>`
   */
  text?: string
}
export default function ErrorPage({ title, text, error }: ErrorPageProps) {
  const logout = useBoundAction(() => auth.actions.logout())
  const isAuthError = !!error && error instanceof AuthenticationError
  const defaults = isAuthError ? AUTH_ERROR_DEFAULTS(logout) : NORMAL_ERROR_DEFAULTS
  // Split content so line breaks go to paragraphs.
  const textContent = (text || defaults.text).split('\n').map((line, index) => <p key={index}>{line}</p>)
  return (
    <Jumbotron>
      <h1>{title || defaults.title}</h1>
      {textContent}
      {error && (
        <p>
          <b>Error message:</b> {error.message}
        </p>
      )}
      {defaults.action && <Box style={{ marginTop: '3rem' }}>{defaults.action}</Box>}
    </Jumbotron>
  )
}
