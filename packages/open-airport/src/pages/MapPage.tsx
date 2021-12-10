import React, { useEffect, useState } from 'react'
import { Tray, useVehicleEvents } from '@lacuna/ui-common'
import { Box, createStyles, makeStyles, AppBar, Toolbar, Typography } from '@material-ui/core'

import { EventMapContainer } from 'components/Map'
import { EventTrayContents, FilterSideBar, FilterState } from 'components'
import { DateTime, Duration, Interval } from 'luxon'
import { clearSelectedEvent, useEventTray } from 'store/tray'
import { useDispatch } from 'react-redux'

// Generate a default time_range between now and 15 minutes ago.
const defaultTimerange = () => {
  return Interval.fromDateTimes(DateTime.now().minus({ minutes: 15 }), DateTime.now())
}

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      display: 'flex',
      width: '100%',
      height: '100%'
    },
    appBar: {
      backgroundColor: theme.palette.background.paper,
      height: 48,
      marginBottom: 1
    }
  })
)

const MIN_DATE = DateTime.now().minus({ months: 3 })
const MAX_DURATION = Duration.fromObject({ days: 14 })

export const MapPage = () => {
  const dispatch = useDispatch()
  const classes = useStyles()

  useEffect(() => {
    return () => {
      dispatch(clearSelectedEvent())
    }
  }, [dispatch])

  const [useLiveData, setUseLiveData] = useState(true)
  const handleToggleLive = (useLive: boolean) => {
    setUseLiveData(useLive)
    setFilters({ ...filters, time_range: defaultTimerange() })
  }
  const [filters, setFilters] = useState<FilterState>({
    time_range: defaultTimerange()
  })

  const onFiltersChange = (newFilters: FilterState) => {
    if (!newFilters.time_range && useLiveData) {
      setFilters({ ...newFilters, time_range: defaultTimerange() })
    } else {
      setFilters(newFilters)
    }
  }

  const onFiltersReset = () => {
    if (Object.keys(filters).length > 0) {
      setFilters({})
    }
  }

  const { events, params } = useVehicleEvents()
  const { selectedEvent, relatedEvents } = useEventTray() || {}
  const shouldLoadLiveData = useLiveData && !selectedEvent

  return (
    <>
      <Box className={classes.root}>
        <Box display='flex' flexDirection='column' width={300}>
          <FilterSideBar
            filters={filters}
            onToggleLive={handleToggleLive}
            useLive={useLiveData}
            onFiltersChange={onFiltersChange}
            onFiltersReset={onFiltersReset}
            minDate={MIN_DATE}
            maxDuration={MAX_DURATION}
            enabledFilters={[
              'vehicle_id',
              'time_range',
              'provider_id',
              'vehicle_event',
              'geography_id',
              'vehicle_state'
            ]}
          />
        </Box>
        <Box width={'100%'}>
          <AppBar elevation={1} position='static' className={classes.appBar}>
            <Toolbar style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {params?.time_range && (
                <>
                  <Typography variant='body2' color='textPrimary'>
                    {events.length === params.limit
                      ? `Showing maximum of ${events.length} events`
                      : `Showing ${events.length} events`}

                    {useLiveData && (
                      <>
                        {' from '}
                        <b>
                          {DateTime.fromMillis(params.time_range.start).toLocaleString(
                            DateTime.DATETIME_SHORT_WITH_SECONDS
                          )}
                        </b>
                        {' to '}
                        <b>
                          {DateTime.fromMillis(params.time_range.end).toLocaleString(
                            DateTime.DATETIME_SHORT_WITH_SECONDS
                          )}
                        </b>
                      </>
                    )}
                  </Typography>
                </>
              )}
            </Toolbar>
          </AppBar>
          <EventMapContainer {...{ filters, useLiveData: shouldLoadLiveData }} />
        </Box>
      </Box>
      <Tray
        {...{
          title: 'Event Details',
          open: selectedEvent !== undefined,
          onClose: () => {
            dispatch(clearSelectedEvent())
          }
        }}
      >
        {selectedEvent !== undefined ? <EventTrayContents {...{ selectedEvent, relatedEvents }} /> : <></>}
      </Tray>
    </>
  )
}
