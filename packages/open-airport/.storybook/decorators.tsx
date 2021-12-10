import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { baseTheme } from '@lacuna/ui-common'
import CssBaseline from '@material-ui/core/CssBaseline'

export const withBase = (Story: React.ComponentType) => (
  <React.Fragment>
    <CssBaseline />
    <ThemeProvider theme={baseTheme}>
      <Story />
    </ThemeProvider>
  </React.Fragment>
)
