import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

import { CommonConfig } from '@lacuna/agency-config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withBase = (Story: React.ComponentType) => (
  <React.Fragment>
    <CssBaseline />
    <ThemeProvider theme={createMuiTheme(CommonConfig.theme)}>
      <Story />
    </ThemeProvider>
  </React.Fragment>
)
