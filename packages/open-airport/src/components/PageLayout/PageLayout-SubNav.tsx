import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Typography, AppBar, Breadcrumbs, Toolbar, ListItemIcon } from '@material-ui/core'
import { useAirport, useAirports } from 'hooks'
import { AgencyKey } from '@lacuna/agency-config'
import { AirportNavTabs } from 'components/Airport/AirportNavTabs'
import { AppPageSpec } from '@lacuna/ui-common'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    },
    main: {
      flexGrow: 1,
      height: '100%',
      overflow: 'auto',
      display: 'flex'
    },
    subAppBar: {
      backgroundColor: theme.palette.type === 'light' ? theme.palette.primary.light : theme.palette.primary.dark
    },
    pageIcon: {
      marginRight: theme.spacing(1),
      minWidth: theme.spacing(0)
    },
    title: {
      flexGrow: 1
    }
  })
)

export interface PageLayoutSubNavProps {
  page?: AppPageSpec
  contentRight?: JSX.Element
  selectAllEnabled?: boolean
  children: JSX.Element
}

export function PageLayoutSubNav({ page, contentRight, children, selectAllEnabled = false }: PageLayoutSubNavProps) {
  const classes = useStyles()
  const { title, sidebarIcon } = page ?? { title: 'Missing Title', sidebarIcon: undefined }
  const airports = useAirports()
  const { airport, explicitAirport, setAirport, clearAirport } = useAirport({ airports })

  const handleAirportSelection = (agency_key: AgencyKey | undefined) => {
    if (agency_key) {
      setAirport(agency_key)
    } else {
      clearAirport()
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position='static' className={classes.subAppBar}>
        <Toolbar variant='dense'>
          <ListItemIcon className={classes.pageIcon}>{sidebarIcon}</ListItemIcon>
          <Breadcrumbs aria-label='breadcrumb' className={classes.title}>
            <Typography color='textPrimary'>{title}</Typography>
            <Typography color='textPrimary'>
              {selectAllEnabled && explicitAirport === undefined ? 'ALL' : airport.name}
            </Typography>
          </Breadcrumbs>
          {contentRight}
          <AirportNavTabs
            {...{
              airports,
              airport,
              explicitAirport,
              onAirportSelection: handleAirportSelection,
              selectAllEnabled
            }}
          />
        </Toolbar>
      </AppBar>
      <div className={classes.main}>{children}</div>
    </div>
  )
}
