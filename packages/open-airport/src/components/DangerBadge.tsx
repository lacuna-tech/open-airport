import { createStyles } from '@material-ui/core/styles'
import { withStyles, Badge } from '@material-ui/core'
import { red } from '@material-ui/core/colors'

export const DangerBadge = withStyles(theme =>
  createStyles({
    root: {
      color: red[theme.palette.type === 'light' ? 600 : 400],
      '& .MuiBadge-badge': {
        backgroundColor: theme.palette.text.secondary,
        color: theme.palette.background.paper
      }
    }
  })
)(Badge)
