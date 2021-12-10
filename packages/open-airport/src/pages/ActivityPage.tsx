import React, { useEffect, useState } from 'react'
import { Tray, VehicleEventType } from '@lacuna/ui-common'
import {
  AppBar,
  Box,
  createStyles,
  IconButton,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography
} from '@material-ui/core'
import {
  EventsTable,
  EventTrayContents,
  FilterSideBar,
  FilterState,
  SELECTABLE_FILTERS,
  TripsTable,
  TripTrayContents
} from 'components'
import { EventTrayMapContainer, TripEventsMapContainer } from 'components/Map'
import { useDispatch } from 'react-redux'
import { clearSelectedEvent, clearSelectedTrip, useEventTray, useTripTray } from 'store/tray'
import { usePrevious } from 'react-use'
import { CloseIcon } from '@material-ui/data-grid'
import { DateTime } from 'luxon'

const useStyles = makeStyles<Theme, { mapExpanded: boolean }>(theme =>
  createStyles({
    root: {
      width: '100%',
      height: '100%'
    },
    filterAndTableContainer: {
      display: 'flex',
      width: '100%',
      height: '100%'
    },
    filterDrawerContainer: {
      width: 280
    },
    tableContainer: {
      width: '100%'
    },
    appBar: {
      backgroundColor: theme.palette.background.paper
    },
    tab: {
      color: theme.palette.action.active
    },
    expandedMapContainer: {
      width: 'calc(100% - 500px)',
      height: '100%',
      position: 'absolute', // allow "stacking" of components without hiding/unmounting
      zIndex: 10, // float above table/filters
      flexDirection: 'column',
      display: ({ mapExpanded }) => (mapExpanded ? 'flex' : 'none')
    }
  })
)
const MIN_DATE = DateTime.now().minus({ months: 3 })

export const ActivityPage = () => {
  const dispatch = useDispatch()
  const [selectedTab, setSelectedTab] = useState(0)
  const [filters, setFilters] = useState<FilterState>({} as FilterState)
  const [mapExpanded, setMapExpanded] = useState(false)
  const [selectedTripEvent, setSelectedTripEvent] = useState<VehicleEventType | undefined>()

  const classes = useStyles({ mapExpanded })
  const previousTab = usePrevious(selectedTab)

  useEffect(() => {
    if (previousTab !== selectedTab) {
      dispatch(clearSelectedEvent())
      dispatch(clearSelectedTrip())
    }
    return function cleanup() {
      dispatch(clearSelectedEvent())
      dispatch(clearSelectedTrip())
    }
  }, [dispatch, selectedTab, previousTab])

  const handleTabsChange = (event: React.ChangeEvent<Record<string, unknown>>, newValue: number) => {
    setSelectedTab(newValue)
  }

  const onFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const onFiltersReset = () => {
    setFilters({} as FilterState)
  }

  const onMapExpanded = () => {
    setMapExpanded(true)
  }

  const onTripEventSelected = (event?: VehicleEventType) => {
    dispatch(clearSelectedEvent())
    setSelectedTripEvent(event)
  }

  const { selectedEvent } = useEventTray() || {}
  const { selectedTrip } = useTripTray() || {}
  const baseFilters = ['vehicle_id', 'time_range', 'provider_id']
  const enabledFilters =
    selectedTab === 0
      ? // event filters
        ([...baseFilters, 'vehicle_event', 'vehicle_state', 'geography_id'] as SELECTABLE_FILTERS[])
      : // trip filters
        ([...baseFilters, 'transaction_type', 'service_type', 'geography_id'] as SELECTABLE_FILTERS[])
  return (
    <Box>
      {/* Expanded map overlay */}
      <Paper className={classes.expandedMapContainer}>
        <Box display='flex' alignItems='center'>
          <IconButton edge='start' color='inherit' onClick={() => setMapExpanded(false)}>
            <CloseIcon />
          </IconButton>
          <Typography variant='h6'>Close</Typography>
        </Box>
        <Box className={classes.root}>
          {selectedTrip && (
            <TripEventsMapContainer
              {...{ events: selectedTrip.trip_events_log as VehicleEventType[], selectedTripEvent }}
            />
          )}
          {selectedEvent && (
            <EventTrayMapContainer
              {...{
                selectedEvent,
                useLiveData: false,
                onRelatedEventsSelected: () => null
              }}
            />
          )}
        </Box>
      </Paper>

      <Box className={classes.root} display='flex'>
        <Box className={classes.filterDrawerContainer}>
          <FilterSideBar
            filters={filters}
            onFiltersChange={onFiltersChange}
            onFiltersReset={onFiltersReset}
            enabledFilters={enabledFilters}
            hideAppbar={mapExpanded}
            minDate={MIN_DATE}
          />
        </Box>
        <Box className={classes.root}>
          <AppBar
            elevation={1}
            position='static'
            className={classes.appBar}
            style={{ display: mapExpanded ? 'none' : undefined }}
          >
            <Tabs value={selectedTab} onChange={handleTabsChange} aria-label='activity-tabs'>
              <Tab label='Events' className={classes.tab} />
              <Tab label='Trips' className={classes.tab} />
            </Tabs>
          </AppBar>

          <Box className={classes.filterAndTableContainer}>
            <Box className={classes.tableContainer}>
              {selectedTab === 0 ? <EventsTable filters={filters} /> : <TripsTable filters={filters} />}
            </Box>
          </Box>
          <Tray
            {...{
              title: 'Event Details',
              open: selectedEvent !== undefined,
              onClose: () => {
                dispatch(clearSelectedEvent())
                setMapExpanded(false)
              }
            }}
          >
            {selectedEvent ? (
              <EventTrayContents {...{ selectedEvent, showMiniMap: true, onMapExpanded, mapExpanded }} />
            ) : (
              <></>
            )}
          </Tray>
          <Tray
            {...{
              title: 'Trip Details',
              open: selectedTrip !== undefined,
              onClose: () => {
                dispatch(clearSelectedTrip())
                setMapExpanded(false)
              }
            }}
          >
            {selectedTrip ? (
              <TripTrayContents {...{ selectedTrip, onMapExpanded, mapExpanded, onTripEventSelected }} />
            ) : (
              <></>
            )}
          </Tray>
        </Box>
      </Box>
    </Box>
  )
}
