import React from 'react'
import { Tab, withStyles, Theme, createStyles, Tabs } from '@material-ui/core'

export const AntTabs = withStyles(theme => ({
  root: {},
  indicator: {
    backgroundColor: theme.palette.primary.main
  }
}))(Tabs)

export const AntTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      minWidth: 72,
      fontWeight: theme.typography.fontWeightMedium,
      marginRight: theme.spacing(4)
    },
    '&:hover': {
      color: theme.palette.type === 'light' ? theme.palette.primary.dark : theme.palette.primary.light,
      opacity: 1
    },
    '&$selected': {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightMedium
    },
    '&:focus': {
      color: theme.palette.type === 'light' ? theme.palette.primary.dark : theme.palette.primary.light
    }
  })
)((props: { label: string }) => <Tab disableRipple {...props} />)
