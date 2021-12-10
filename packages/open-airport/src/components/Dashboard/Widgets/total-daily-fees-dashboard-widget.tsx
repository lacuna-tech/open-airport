import React from 'react'
import { Paper, Avatar, Typography, Box, PaperProps, WithStyles } from '@material-ui/core'
import { getFormattedMetricValue, MetricAggregate } from '@lacuna/ui-common'

interface WidgetProps extends Omit<PaperProps, 'classes'>, WithStyles<'avatarInvert'> {
  aggregate: MetricAggregate | undefined
}

export const TotalDailyFeesDashboardWidget: React.FC<WidgetProps> = ({ aggregate, classes, ...props }: WidgetProps) => {
  return (
    <Paper {...props}>
      <Box display='flex'>
        <Box flexGrow={1}>
          <Typography variant='overline'>Total Daily Fees</Typography>
          <Typography variant='h6'>
            {aggregate ? getFormattedMetricValue({ name: 'airport.fees.count', aggregate }) : '0'}
          </Typography>
        </Box>
        <Box alignSelf='center'>
          <Avatar className={classes.avatarInvert}>$</Avatar>
        </Box>
      </Box>
    </Paper>
  )
}
