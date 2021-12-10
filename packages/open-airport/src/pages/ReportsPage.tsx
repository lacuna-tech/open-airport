import React, { useState } from 'react'
import { AppBar, Box, Tab, Tabs, Theme } from '@material-ui/core'
import { BarChart, ShowChart, List } from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'
import { CHART_TYPE, FilterSideBar, FilterState, GRAPH_TYPE, ReportsContainer, SELECTABLE_FILTERS } from 'components'
import { TimeRangePreset } from '@lacuna/ui-common'
import { DateTime } from 'luxon'

const useStyles = makeStyles<Theme>(theme => ({
  flexContainer: {
    justifyContent: 'flex-end'
  },
  appBar: {
    backgroundColor: theme.palette.background.paper
  },
  container: {
    width: '100%'
  },
  reportContainer: {
    width: '100%',
    padding: theme.spacing(0, 6)
  }
}))

const getFilters = (selectedGraph: GRAPH_TYPE, selectedTab: string) => {
  const baseFilters = ['provider_id', 'geography_id']
  if (selectedTab === 'line') {
    if (selectedGraph === 'events_by_type') {
      return [...baseFilters, 'vehicle_event', 'time_range']
    }
    if (selectedGraph === 'vehicle_state_by_type') {
      return [...baseFilters, 'vehicle_state', 'time_range']
    }
    return [...baseFilters, 'time_range']
  }
  if (selectedTab === 'bar') {
    if (selectedGraph === 'events_by_type') {
      return [...baseFilters, 'vehicle_event']
    }
    if (selectedGraph === 'vehicle_state_by_type') {
      return [...baseFilters, 'vehicle_state']
    }
    return [...baseFilters]
  }
  if (selectedTab === 'table') {
    return [...baseFilters, 'time_range']
  }
  return baseFilters
}

const tabs: CHART_TYPE[] = ['line', 'bar', 'table']
const MIN_DATE = DateTime.now().minus({ months: 3 })

export const ReportsPage = () => {
  const [filters, setFilters] = useState<FilterState>({ time_range: TimeRangePreset.PAST_HOUR })
  const [selectedGraph, setSelectedGraph] = useState<GRAPH_TYPE>('pudo_vs_enter_exit')
  const [selectedTab, setSelectedTab] = useState(0)
  const classes = useStyles()

  const handleTabsChange = (event: React.ChangeEvent<Record<string, unknown>>, newValue: number) => {
    setSelectedTab(newValue)
  }

  const onFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }
  const onFiltersReset = () => {
    setFilters({})
  }

  const onSelectedGraphChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedGraph(event.target.value as GRAPH_TYPE)
  }

  const enabledFilters = getFilters(selectedGraph, tabs[selectedTab]) as SELECTABLE_FILTERS[]
  const selectedChart = tabs[selectedTab]

  return (
    <Box display='flex'>
      <FilterSideBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        onFiltersReset={onFiltersReset}
        enabledFilters={enabledFilters}
        minDate={MIN_DATE}
      />
      <Box className={classes.container}>
        <AppBar position='static' className={classes.appBar}>
          <Tabs value={selectedTab} onChange={handleTabsChange}>
            <Tab icon={<ShowChart color='action' />} style={{ minWidth: 40 }} />
            <Tab icon={<BarChart color='action' />} style={{ minWidth: 40 }} />
            <Tab icon={<List color='action' />} style={{ minWidth: 40 }} />
          </Tabs>
        </AppBar>
        <Box style={{ display: 'flex' }} className={classes.reportContainer}>
          <Box style={{ marginTop: 16 }}></Box>
          <ReportsContainer
            {...{
              selectedChart,
              selectedGraph,

              filterState: filters,
              onSelectedGraphChange
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
