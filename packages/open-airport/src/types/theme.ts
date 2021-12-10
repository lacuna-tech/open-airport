import { createMuiTheme } from '@material-ui/core/styles'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { PaletteType, Theme } from '@material-ui/core'

const { theme } = AirportConsoleConfig

export const createAppTheme: (paletteType: PaletteType) => Theme = paletteType =>
  createMuiTheme({ ...theme, palette: { ...theme.palette, type: paletteType } })
