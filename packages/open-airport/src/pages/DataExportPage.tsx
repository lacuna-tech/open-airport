import React, { useState } from 'react'
import {
  AppBar,
  Box,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography
} from '@material-ui/core'
import { CloudDownload, GetApp } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'
import { DateTime } from 'luxon'
import { useDispatch } from 'react-redux'
import { actions as tripActions } from 'store/trips'
import {
  AirportEventMeasureNames,
  AirportVehicleStateMeasureNames,
  LiteralArray,
  makeRange,
  metricsV2,
  MetricName,
  MetricRequest,
  vehicleEvents,
  LoadingIcon
} from '@lacuna/ui-common'
import { useGeographiesWithMetadata } from '../hooks'

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: theme.palette.background.paper,
    height: 48,
    justifyContent: 'center',
    padding: `0px ${theme.spacing(2)}px`
  },
  buttonWithLabel: {
    paddingBottom: 0
  },
  buttonWithLabelContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  list: {
    width: 400
  },
  paper: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    minHeight: 260
  },
  select: {
    marginRight: theme.spacing(2),
    padding: theme.spacing(1)
  },
  loadingIconBox: {
    padding: 12
  }
}))

const FileDownloadList = ({
  keyName,
  classes,
  items
}: {
  keyName: string
  classes: ClassNameMap<'list' | 'loadingIconBox'>
  items: {
    primary: string
    secondary?: string
    download: () => void
  }[]
}) => {
  const [downloading, setDownloading] = useState(Array(items.length).fill(false))
  const updateDownloading = (index: number, val: boolean) =>
    setDownloading(downloading.map((e, i) => (i === index ? val : e)))
  return (
    <List className={classes.list}>
      {items.map(({ primary, secondary, download }, index) => (
        <React.Fragment key={`${keyName}-item-${index}`}>
          <ListItem alignItems='center' style={{ marginBottom: 8 }}>
            <ListItemText {...{ primary, secondary }} />
            <ListItemSecondaryAction>
              {downloading[index] ? (
                <Box className={classes.loadingIconBox}>
                  <LoadingIcon />
                </Box>
              ) : (
                <IconButton
                  onClick={async () => {
                    updateDownloading(index, true)
                    await download()
                    updateDownloading(index, false)
                  }}
                >
                  <CloudDownload />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  )
}

// mtd, last month, month before last
const downloadTimeranges: [number, number][] = makeRange(3).map(n => {
  if (n === 0) {
    return [DateTime.now().startOf('month').valueOf(), DateTime.now().valueOf()]
  }
  return [
    DateTime.now().minus({ months: n }).startOf('month').valueOf(),
    DateTime.now().minus({ months: n }).endOf('month').valueOf()
  ]
})

// start of month to "now"
const monthToDateStr = `${DateTime.now().startOf('month').toFormat('LLL d')} - ${DateTime.now().toFormat('LLL d')}`
const helperText = 'Includes data up until time of download'

const useFileDownloadItems = () => {
  const dispatch = useDispatch()
  const allGeographies = useGeographiesWithMetadata()
  const allGeographyIds = React.useMemo(() => allGeographies.map(geo => geo.geography_id), [allGeographies])

  const handleTripsClick = async ([start, end]: [number, number]) => {
    await dispatch(tripActions.downloadTripsCsv({ time_range: { start, end } }))
  }

  const handleMetricsClick = async ([start_date, end_date]: [number, number]) => {
    const request: MetricRequest = {
      key: 'metrics-csv-download',
      query: {
        measures: [
          'airport.trips.count',
          'airport.fees.count',
          'airport.passenger_wait.avg',
          'airport.dwell.avg',
          ...LiteralArray<MetricName>(AirportEventMeasureNames),
          ...LiteralArray<MetricName>(AirportVehicleStateMeasureNames)
        ] as Partial<MetricName>[],
        filters: [],
        interval: 'PT1H',
        start_date,
        end_date,
        dimensions: [],
        format: 'csv'
      },
      dimensionValues: {}
    }
    await dispatch(metricsV2.actions.loadMetricsCsv({ request }))
  }

  const handleEventsClick = async ([start, end]: [number, number]) => {
    await dispatch(
      vehicleEvents.actions.loadVehicleEventsCsv({
        time_range: { start, end },
        grouping_type: 'all_events',
        geography_ids: allGeographyIds
      })
    )
  }

  return {
    metrics: [
      {
        primary: monthToDateStr,
        secondary: helperText,
        download: async () => handleMetricsClick(downloadTimeranges[0])
      },
      {
        primary: DateTime.now().minus({ months: 1 }).toFormat('LLL yyyy'),
        download: async () => handleMetricsClick(downloadTimeranges[1])
      },
      {
        primary: DateTime.now().minus({ months: 2 }).toFormat('LLL yyyy'),
        download: async () => handleMetricsClick(downloadTimeranges[2])
      }
    ],
    events: [
      {
        primary: monthToDateStr,
        secondary: helperText,
        download: async () => handleEventsClick(downloadTimeranges[0])
      },
      {
        primary: DateTime.now().minus({ months: 1 }).toFormat('LLL yyyy'),
        download: async () => handleEventsClick(downloadTimeranges[1])
      },
      {
        primary: DateTime.now().minus({ months: 2 }).toFormat('LLL yyyy'),
        download: async () => handleEventsClick(downloadTimeranges[2])
      }
    ],
    trips: [
      {
        primary: monthToDateStr,
        secondary: helperText,
        download: async () => handleTripsClick(downloadTimeranges[0])
      },
      {
        primary: DateTime.now().minus({ months: 1 }).toFormat('LLL yyyy'),
        download: async () => handleTripsClick(downloadTimeranges[1])
      },
      {
        primary: DateTime.now().minus({ months: 2 }).toFormat('LLL yyyy'),
        download: async () => handleTripsClick(downloadTimeranges[2])
      }
    ]
  }
}
export const DataExportPage = () => {
  const classes = useStyles()
  const items = useFileDownloadItems()
  return (
    <Box width='100%'>
      <AppBar position='static' className={classes.appBar}>
        <Box display='flex' alignItems='center'>
          <GetApp color='action' />
          <Typography color='textPrimary'>Data Export</Typography>
        </Box>
      </AppBar>
      <Grid container spacing={3}>
        <Grid item>
          <Paper className={classes.paper}>
            <Typography variant='h6'>Metrics</Typography>
            <FileDownloadList {...{ keyName: 'metrics', classes, items: items.metrics }} />
          </Paper>
        </Grid>
        <Grid item>
          <Paper className={classes.paper}>
            <Typography variant='h6'>Events</Typography>
            <FileDownloadList {...{ keyName: 'events', classes, items: items.events }} />
          </Paper>
        </Grid>
        <Grid item>
          <Paper className={classes.paper}>
            <Typography variant='h6'>Trips</Typography>
            <FileDownloadList {...{ keyName: 'trips', classes, items: items.trips }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
