import * as React from 'react'
import { CircularProgress, Box } from '@material-ui/core'

export function CenteredLoadingSpinner() {
  return (
    <Box display='flex' style={{ height: '100%', width: '100%' }}>
      <Box style={{ margin: 'auto' }}>
        <CircularProgress disableShrink color='inherit' />
      </Box>
    </Box>
  )
}
