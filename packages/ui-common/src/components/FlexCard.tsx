import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { Box, CardActions, Divider } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100%'
    },
    flexBox: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest
      })
    },
    expandOpen: {
      transform: 'rotate(180deg)'
    },
    listContainer: {
      padding: 0,
      paddingBottom: '0 !important',
      height: '100%'
    },
    cardHeader: {
      padding: '8px 16px 0px',
      color: theme.palette.text.secondary,
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  })
)

interface FlexCardProps extends React.HTMLProps<HTMLDivElement> {
  title?: string
  icon?: JSX.Element
  children: JSX.Element
  headerAction?: JSX.Element
  actions?: JSX.Element
  showFooterDivider?: boolean
  centerTitle?: boolean
}

export function FlexCard(props: FlexCardProps) {
  const classes = useStyles()

  const { title, icon, headerAction, children, actions, showFooterDivider, centerTitle, ...rootProps } = props
  const style: React.CSSProperties | undefined = centerTitle ? { textAlign: 'center' } : undefined

  return (
    <div {...rootProps}>
      <Card className={classes.root}>
        <Box className={classes.flexBox}>
          {title && (
            <CardHeader
              className={classes.cardHeader}
              avatar={icon}
              action={headerAction}
              title={<Typography variant='overline'>{title}</Typography>}
              style={style}
            />
          )}
          <Box style={{ height: '100%' }}>
            <CardContent className={classes.listContainer}>{children}</CardContent>
          </Box>
          {showFooterDivider && <Divider />}
          {actions && <CardActions disableSpacing>{actions}</CardActions>}
        </Box>
      </Card>
    </div>
  )
}
