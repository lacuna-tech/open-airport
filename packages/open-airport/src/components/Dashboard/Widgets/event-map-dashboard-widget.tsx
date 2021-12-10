import React, { useCallback, useEffect } from 'react'
import { Grid, CardActionArea, Button, WithStyles } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMap } from '@fortawesome/pro-solid-svg-icons'
import { AirportDefinition, AgencyKey } from '@lacuna/agency-config'
import { MapContainer, EventPreviewMap } from 'components/Map'
import LocalAirportIcon from '@material-ui/icons/LocalAirport'
import { Dimensions } from 'components/Chart'
import { FlexCard, GetVehicleEventsFilterParams, LoadState, useVehicleEvents } from '@lacuna/ui-common'
import { DateTime } from 'luxon'
import { useGeographiesWithMetadata } from '../../../hooks'

interface WidgetProps
  extends Omit<React.HTMLProps<HTMLDivElement>, 'classes'>,
    WithStyles<'cardTall' | 'centered' | 'cardActionButton'> {
  airport: AirportDefinition
  onAirportNavigate: (agency_key: AgencyKey) => void
}

const requestParams: GetVehicleEventsFilterParams = {
  grouping_type: 'all_events',
  time_range: {
    start: DateTime.now().minus({ minutes: 15 }).valueOf(),
    end: DateTime.now().valueOf()
  }
}

export const EventMapDashboardWidget: React.FC<WidgetProps> = ({
  airport,
  onAirportNavigate,
  classes,
  ...props
}: WidgetProps) => {
  const { agency_key, name } = airport
  const allGeographies = useGeographiesWithMetadata()
  const allGeographyIds = React.useMemo(() => allGeographies.map(geo => geo.geography_id), [allGeographies])
  const { events, loadState, fetchEvents } = useVehicleEvents(requestParams, allGeographyIds)

  useEffect(() => fetchEvents(), [fetchEvents])
  const dependenciesLoading = loadState !== LoadState.loaded

  const handleAirportClicked = useCallback(() => onAirportNavigate(agency_key), [agency_key, onAirportNavigate])

  return (
    <FlexCard
      {...{
        props,
        title: `${name}`,
        className: classes.cardTall,
        icon: <LocalAirportIcon />,
        actions: (
          <Grid container style={{ justifyContent: 'center' }}>
            <Grid item xs={6} className={classes.centered}>
              <Button
                className={classes.cardActionButton}
                startIcon={<FontAwesomeIcon icon={faMap} size='lg' />}
                size='small'
                color='primary'
                onClick={handleAirportClicked}
              >
                View Map
              </Button>
            </Grid>
          </Grid>
        )
      }}
    >
      <CardActionArea style={{ height: '100%' }} onClick={handleAirportClicked}>
        <MapContainer {...{ dependenciesLoading }}>
          {(onMapLoaded: () => void, dimensions: Dimensions) => (
            <EventPreviewMap key={name} {...{ events, dimensions, airport, onMapLoaded }} />
          )}
        </MapContainer>
      </CardActionArea>
    </FlexCard>
  )
}
