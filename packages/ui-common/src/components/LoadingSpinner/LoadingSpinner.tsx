/**
 * Loading spinner with optional `message`
 */

import * as React from 'react'
import { Typography, CircularProgress } from '@material-ui/core'

export interface LoadingSpinnerProps {
  message?: string
  compact?: boolean
}

export default function LoadingSpinner(props: LoadingSpinnerProps) {
  const { message, compact = false } = props
  return (
    <div style={{ textAlign: 'center', margin: compact ? 0 : 30 }}>
      <CircularProgress />
      <Typography variant='body1' style={{ marginTop: 5 }}>
        {message}
      </Typography>
    </div>
  )
}
