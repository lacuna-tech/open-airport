import React from 'react'
import { WithStyles } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCarAlt } from '@fortawesome/pro-solid-svg-icons'
import { ChartContainer, DailyTripsChart } from 'components/Chart'
import { CenteredLoadingSpinner, FlexCard, MetricAggregate } from '@lacuna/ui-common'

interface WidgetProps extends Omit<React.HTMLProps<HTMLDivElement>, 'classes'>, WithStyles<'cardTall'> {
  yesterdaysAggregate: MetricAggregate | undefined
  todaysAggregate: MetricAggregate | undefined
}

export const TotalDailyTripsChartDashboardWidget: React.FC<WidgetProps> = ({
  yesterdaysAggregate,
  todaysAggregate,
  classes,
  ...props
}: WidgetProps) => {
  return (
    <FlexCard
      {...{
        props,
        title: 'Total Daily Trips',
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
        {dimensions =>
          yesterdaysAggregate && todaysAggregate ? (
            <DailyTripsChart {...{ yesterdaysAggregate, todaysAggregate, dimensions }} />
          ) : (
            <CenteredLoadingSpinner />
          )
        }
      </ChartContainer>
    </FlexCard>
  )
}
