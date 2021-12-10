/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Grid, Container } from '@material-ui/core'
import { AgencyKey } from '@lacuna/agency-config'
import { useHistory } from 'react-router'
import { QueryString, LiteralKeys, LoadingSpinner, single, MetricAggregate, LoadState } from '@lacuna/ui-common'
import clsx from 'clsx'

import {
  TotalDailyTripsDashboardWidget,
  TotalDailyFeesDashboardWidget,
  TotalDailyFeesChartDashboardWidgetOA,
  TotalDailyTripsChartDashboardWidget,
  AvgTimesDashboardWidget,
  TotalDailyEntriesDashboardWidget,
  TotalDailyExitsDashboardWidget,
  EventsMultilineChartDashboardWidget
} from 'components/Dashboard'
import { ContainerFullPage } from 'components/PageLayout'
import { EventMapDashboardWidget } from 'components/Dashboard/Widgets/event-map-dashboard-widget'
import { DateTime } from 'luxon'
import { useMetricsTuple } from '@lacuna/ui-common/src/store/metricsV2'
import { useAirport, useAirports } from '../hooks'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {},
    main: {
      height: '100%',
      overflow: 'auto'
    },
    gridContainer: {
      height: '100%',
      marginTop: 20
    },
    centered: {
      textAlign: 'center'
    },
    cardActionButton: {
      color: theme.palette.action.active
    },
    cardShort: {
      height: '13vh'
    },
    cardTall: {
      height: '35vh'
    },
    paper: {
      padding: theme.spacing(2),
      color: theme.palette.text.secondary
    },
    paperInvert: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main)
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main)
    },
    avatarInvert: {
      backgroundColor: theme.palette.getContrastText(theme.palette.primary.main),
      color: theme.palette.primary.main
    },
    positive: {
      marginLeft: 8,
      padding: 3,
      color: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.08)'
    },
    negative: {
      marginLeft: 8,
      padding: 3,
      color: '#f44336',
      backgroundColor: 'rgba(244, 67, 54, 0.08)'
    },
    currentUtilizationGauge: {
      marginRight: 20
    }
  })
)

const defaultAggregate: MetricAggregate = {
  measures: { 'airport.trips.count': 0, 'airport.passenger_connect_time.avg': 0 }
} as MetricAggregate

export default function DashboardPage() {
  const classes = useStyles()
  const history = useHistory()
  const airports = useAirports()

  const { airport, explicitAirport } = useAirport({ airports })
  const [selectedAirports, setSelectedAirports] = useState<AgencyKey[]>(LiteralKeys<AgencyKey>(airports))

  useEffect(() => {
    // Rebuild the selectedAirports array when airport or explicitAirport change
    setSelectedAirports(explicitAirport === undefined ? LiteralKeys<AgencyKey>(airports) : [explicitAirport.agency_key])
  }, [airport, airports, explicitAirport])

  const featuredAirport = selectedAirports.length > 0 ? airports[selectedAirports[0]] : undefined

  const handleAirportNavigate = useCallback(
    (agency_key: AgencyKey) => {
      history.push(`/map?${QueryString().set({ agency: agency_key })}`)
    },
    [history]
  )

  const {
    previous: { aggregates: yesterdaysAggregates },
    current: { aggregates: todaysAggregates },
    loadState
  } = useMetricsTuple(
    () => ({
      key: 'dashboard-daily',
      query: {
        measures: [
          'airport.trips.count',
          'airport.fees.count',
          'airport.passenger_connect_time.avg',
          'airport.dwell.avg',
          'airport.event.enter_jurisdiction.count',
          'airport.event.leave_jurisdiction.count'
        ],
        filters: [],
        interval: 'P1D',
        previousTimeRange: {
          start_date: DateTime.now().startOf('day').minus({ day: 1 }).valueOf(),
          end_date: DateTime.now().endOf('day').minus({ day: 1 }).valueOf()
        },
        currentTimeRange: {
          start_date: DateTime.now().startOf('day').valueOf(),
          end_date: DateTime.now().endOf('hour').valueOf()
        },
        dimensions: []
      },
      active: true,
      salt: 0,
      dimensionValues: {}
    }),
    []
  )

  const emptyAggregate = loadState === LoadState.loaded ? defaultAggregate : undefined

  const yesterdaysAggregate = useMemo(
    () => (yesterdaysAggregates && yesterdaysAggregates.length > 0 ? single(yesterdaysAggregates) : emptyAggregate),
    [yesterdaysAggregates, emptyAggregate]
  )
  const todaysAggregate = useMemo(
    () => (todaysAggregates && todaysAggregates.length > 0 ? single(todaysAggregates) : emptyAggregate),
    [todaysAggregates, emptyAggregate]
  )

  return (
    <ContainerFullPage>
      <div className={classes.root}>
        <Container maxWidth='lg' className={classes.gridContainer}>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <TotalDailyTripsDashboardWidget
                {...{
                  aggregate: todaysAggregate,
                  classes,
                  className: clsx(classes.paper, classes.cardShort)
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TotalDailyEntriesDashboardWidget
                {...{ aggregate: todaysAggregate, classes, className: clsx(classes.paper, classes.cardShort) }}
              />
            </Grid>
            <Grid item xs={3}>
              <TotalDailyExitsDashboardWidget
                {...{ aggregate: todaysAggregate, classes, className: clsx(classes.paper, classes.cardShort) }}
              />
            </Grid>
            <Grid item xs={3}>
              <TotalDailyFeesDashboardWidget
                {...{
                  aggregate: todaysAggregate,
                  classes,
                  className: clsx(classes.paperInvert, classes.cardShort)
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <TotalDailyTripsChartDashboardWidget
                {...{
                  todaysAggregate,
                  yesterdaysAggregate,
                  classes,
                  className: clsx(classes.paper, classes.cardShort)
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TotalDailyFeesChartDashboardWidgetOA
                {...{
                  todaysAggregate,
                  yesterdaysAggregate,
                  classes,
                  className: clsx(classes.paper, classes.cardShort)
                }}
              />
            </Grid>
            <Grid item xs={4}>
              {featuredAirport ? (
                <EventMapDashboardWidget
                  {...{
                    airport: featuredAirport,
                    onAirportNavigate: handleAirportNavigate,
                    classes,
                    className: clsx(classes.paper, classes.cardShort)
                  }}
                />
              ) : (
                <LoadingSpinner />
              )}
            </Grid>

            <Grid item xs={3}>
              <AvgTimesDashboardWidget
                {...{
                  aggregate: todaysAggregate,
                  violations: 0,
                  classes,
                  className: clsx(classes.paper, classes.cardShort)
                }}
              />
            </Grid>
            <Grid item xs={9}>
              <EventsMultilineChartDashboardWidget {...{ classes }} />
            </Grid>
          </Grid>
        </Container>
      </div>
    </ContainerFullPage>
  )
}
