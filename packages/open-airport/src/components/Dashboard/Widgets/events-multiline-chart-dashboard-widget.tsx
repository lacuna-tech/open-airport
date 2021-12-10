import React from 'react'
import { WithStyles } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCarAlt } from '@fortawesome/pro-solid-svg-icons'
import { ChartContainer } from 'components/Chart'
import {
  AirportEventMeasureNames,
  FlexCard,
  MetricName,
  LiteralArray,
  useMetrics,
  LoadState,
  CenteredLoadingSpinner
} from '@lacuna/ui-common'
import { PudoEntryExitMultilineChart } from 'components/Chart/PudoEntryExitMultilineChart'
import { DateTime } from 'luxon'

interface WidgetProps extends Omit<React.HTMLProps<HTMLDivElement>, 'classes'>, WithStyles<'cardTall'> {}

export const EventsMultilineChartDashboardWidget: React.FC<WidgetProps> = ({ classes, ...props }: WidgetProps) => {
  const {
    result: { aggregates, loadState }
  } = useMetrics(() => {
    return {
      key: `dashboard-chart-multiline`,
      query: {
        measures: [
          'airport.trips.count',
          'airport.fees.count',
          'airport.passenger_connect_time.avg',
          'airport.dwell.avg',
          ...LiteralArray<MetricName>(AirportEventMeasureNames)
        ],
        filters: [],
        interval: 'PT1H',
        start_date: DateTime.now().startOf('day').valueOf(),
        end_date: DateTime.now().endOf('hour').valueOf(),
        dimensions: ['transaction_type']
      },
      active: true,
      salt: 0,
      dimensionValues: {
        transaction_type: ['pick_up', 'drop_off', null]
      }
    }
  }, [])

  if (loadState === LoadState.loading) {
    return <CenteredLoadingSpinner />
  }

  return (
    <FlexCard
      {...{
        props,
        title: 'Recent Trips vs Enter/Leave Events',
        className: classes.cardTall,
        icon: (
          <FontAwesomeIcon
            {...{
              icon: faCarAlt,
              size: 'lg'
            }}
          />
        )
      }}
    >
      <ChartContainer>
        {dimensions => <PudoEntryExitMultilineChart {...{ aggregates, dimensions, metricInterval: 'PT1H' }} />}
      </ChartContainer>
    </FlexCard>
  )
}
