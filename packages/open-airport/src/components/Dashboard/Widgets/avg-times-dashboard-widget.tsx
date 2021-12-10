import React from 'react'
import { List, Divider, Chip, WithStyles } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStopwatch } from '@fortawesome/pro-solid-svg-icons'
import { ListField } from 'components/List'
import { FlexCard, getFormattedMetricValue, MetricAggregate } from '@lacuna/ui-common'

interface WidgetProps extends Omit<React.HTMLProps<HTMLDivElement>, 'classes'>, WithStyles<'cardTall'> {
  aggregate: MetricAggregate | undefined
}

export const AvgTimesDashboardWidget: React.FC<WidgetProps> = ({ aggregate, classes, ...props }: WidgetProps) => {
  return (
    <FlexCard
      {...{
        props,
        title: 'Daily Times',
        className: classes.cardTall,
        icon: (
          <FontAwesomeIcon
            {...{
              icon: faStopwatch,
              size: 'lg'
            }}
          />
        )
      }}
    >
      <List component='nav' aria-label='Connect Times &amp; Violations' disablePadding>
        <ListField {...{ label: 'Average Connect Time' }}>
          <Chip
            label={aggregate ? getFormattedMetricValue({ name: 'airport.passenger_connect_time.avg', aggregate }) : '-'}
            variant='outlined'
          />
        </ListField>
        <Divider />
        <ListField {...{ label: 'Average Dwell Time' }}>
          <Chip
            label={aggregate ? getFormattedMetricValue({ name: 'airport.dwell.avg', aggregate }) : '-'}
            variant='outlined'
          />
        </ListField>
        <Divider />
      </List>
    </FlexCard>
  )
}
