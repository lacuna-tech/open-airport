import React from 'react'
import { AppPageSpec } from '@lacuna/ui-common'

import DashboardIcon from '@material-ui/icons/Dashboard'
import { Badge } from '@material-ui/core'
import MapIcon from '@material-ui/icons/Map'
import { GetApp, ShowChart } from '@material-ui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCars } from '@fortawesome/pro-solid-svg-icons'
import DashboardPage from './DashboardPage'
import { MapPage } from './MapPage'
import { ReportsPage } from './ReportsPage'
import { ActivityPage } from './ActivityPage'
import { DataExportPage } from './DataExportPage'

const pages: AppPageSpec[] = [
  {
    paths: ['/dashboard'],
    isDefaultPath: true,
    component: DashboardPage,
    title: 'Airport Summary',
    showInSidebar: true,
    sidebarIcon: <DashboardIcon />,
    maximized: true,
    maxContainerSize: 'xl'
  },
  {
    paths: ['/map'],
    component: MapPage,
    title: 'Map',
    showInSidebar: true,
    sidebarIcon: (
      <Badge badgeContent={undefined} color='primary'>
        <MapIcon />
      </Badge>
    ),
    maximized: true,
    maxContainerSize: 'xl'
  },
  {
    paths: ['/reports'],
    component: ReportsPage,
    title: 'Reports',
    showInSidebar: true,
    sidebarIcon: <ShowChart />,
    maximized: true,
    maxContainerSize: false
  },
  {
    paths: ['/activity-log'],
    component: ActivityPage,
    title: 'Activity Log',
    showInSidebar: true,
    sidebarIcon: (
      <Badge color='primary'>
        <FontAwesomeIcon icon={faCars} size='lg' />
      </Badge>
    ),
    maximized: true,
    maxContainerSize: 'xl'
  },
  {
    paths: ['/data-export'],
    component: DataExportPage,
    title: 'Data Export',
    showInSidebar: true,
    sidebarIcon: <GetApp />,
    maximized: true,
    maxContainerSize: 'xl'
  }
]
export default pages
