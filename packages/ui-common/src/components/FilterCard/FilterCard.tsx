import React from 'react'
import { Box, Card, CardHeader, CardContent } from '@material-ui/core'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

import { FilterCardTitle } from './FilterCardTitle'

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      },
      cardContent: {
        flex: 1,
        overflow: 'auto',
        height: '100%',
        padding: theme.spacing(2, 4, 2, 4),
        '&:last-child': { paddingBottom: theme.spacing(2) }
      },

      cardHeader: {
        flex: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1, 2)
      },
      headerContent: {
        display: 'flex',
        alignItems: 'center'
      },
      icon: {
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(1),
        fontSize: 18
      }
    }),
  { name: 'FilterCard' }
)

export interface FilterCardProps {
  header: React.ReactNode
  icon?: React.ReactNode
  classesOverride?: {
    cardContent?: string
  }
}

export const FilterCard: React.FunctionComponent<FilterCardProps> = ({ header, icon, children, classesOverride }) => {
  const classes = useStyles()
  const { cardContent } = classesOverride || {}
  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        disableTypography
        title={
          <Box className={classes.headerContent}>
            {icon != null && <Box className={classes.icon}>{icon}</Box>}
            {typeof header === 'string' ? <FilterCardTitle>{header}</FilterCardTitle> : header}
          </Box>
        }
      />

      <CardContent className={`${classes.cardContent} ${cardContent}`}>{children}</CardContent>
    </Card>
  )
}
