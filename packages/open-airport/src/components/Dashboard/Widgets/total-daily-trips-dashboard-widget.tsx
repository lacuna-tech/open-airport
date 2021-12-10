import React from 'react'
import { Paper, Avatar, Typography, Box, PaperProps, WithStyles } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRoute } from '@fortawesome/pro-solid-svg-icons'
import { MetricAggregate, getFormattedMetricValue } from '@lacuna/ui-common'

interface WidgetProps extends Omit<PaperProps, 'classes'>, WithStyles<'positive' | 'negative' | 'avatar'> {
  aggregate: MetricAggregate | undefined
}

export const TotalDailyTripsDashboardWidget: React.FC<WidgetProps> = ({
  aggregate,
  classes,
  ...props
}: WidgetProps) => {
  return (
    <Paper {...props}>
      <Box display='flex'>
        <Box flexGrow={1}>
          <Typography variant='overline'>Total Daily Trips</Typography>
          <Box display='flex'>
            <Box>
              <Typography variant='h6'>
                {aggregate ? getFormattedMetricValue({ name: 'airport.trips.count', aggregate }) : '0'}
              </Typography>
            </Box>
            {/* <Box alignSelf='center'>
              <span className={dailyTripsDelta >= 0 ? classes.positive : classes.negative}>
                {dailyTripsDelta > 0 ? '+' : ''}
                {dailyTripsDelta}%
              </span>
            </Box> */}
          </Box>
        </Box>
        <Box alignSelf='center'>
          <Avatar className={classes.avatar}>
            <FontAwesomeIcon
              {...{
                icon: faRoute,
                size: '1x'
              }}
            />
          </Avatar>
        </Box>
      </Box>
    </Paper>
  )
}
