import { Theme } from '@material-ui/core/styles'
import { Theme as NivoTheme } from '@nivo/core'

// See default theme - https://github.com/plouc/nivo/blob/master/packages/core/src/theming/defaultTheme.js
export default function getChartTheme(theme: Theme): NivoTheme {
  return {
    tooltip: {
      container: {
        background: theme.palette.background.default
      }
    },
    axis: {
      legend: {
        text: {
          fill: theme.palette.action.active
        }
      },
      ticks: {
        line: {
          stroke: theme.palette.action.active
        },
        text: {
          fill: theme.palette.action.active
        }
      }
    },
    legends: {
      text: {
        stroke: theme.palette.action.active
      }
    }
  }
}
