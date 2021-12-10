import React from 'react'
import { WithStyles } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/pro-solid-svg-icons'
import { ChartContainer, DailyFeesChart } from 'components/Chart'
import { CenteredLoadingSpinner, FlexCard, MetricAggregate } from '@lacuna/ui-common'

interface WidgetProps extends Omit<React.HTMLProps<HTMLDivElement>, 'classes'>, WithStyles<'cardTall'> {
  yesterdaysAggregate: MetricAggregate | undefined
  todaysAggregate: MetricAggregate | undefined
}

export const TotalDailyFeesChartDashboardWidgetOA: React.FC<WidgetProps> = ({
  yesterdaysAggregate,
  todaysAggregate,
  classes,
  ...props
}: WidgetProps) => {
  return (
    <FlexCard
      {...{
        props,
        title: 'Total Daily Fees',
        className: classes.cardTall,
        icon: (
          <FontAwesomeIcon
            {...{
              icon: faDollarSign,
              size: 'lg'
            }}
          />
        )
      }}
    >
      <ChartContainer>
        {dimensions =>
          yesterdaysAggregate && todaysAggregate ? (
            <DailyFeesChart {...{ yesterdaysAggregate, todaysAggregate, dimensions }} />
          ) : (
            <CenteredLoadingSpinner />
          )
        }
      </ChartContainer>
    </FlexCard>
  )
}
