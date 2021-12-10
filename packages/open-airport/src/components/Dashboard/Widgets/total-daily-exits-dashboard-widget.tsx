import React from 'react'
import { Paper, Avatar, Typography, Box, PaperProps, WithStyles } from '@material-ui/core'
import { getFormattedMetricValue, MetricAggregate } from '@lacuna/ui-common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/pro-solid-svg-icons'

interface WidgetProps extends Omit<PaperProps, 'classes'>, WithStyles<'avatar'> {
  aggregate: MetricAggregate | undefined
}

export const TotalDailyExitsDashboardWidget: React.FC<WidgetProps> = ({
  aggregate,
  classes,
  ...props
}: WidgetProps) => {
  return (
    <Paper {...props}>
      <Box display='flex'>
        <Box flexGrow={1}>
          <Typography variant='overline'>Total Daily Exits</Typography>
          <Typography variant='h6'>
            {aggregate ? getFormattedMetricValue({ name: 'airport.event.leave_jurisdiction.count', aggregate }) : '0'}
          </Typography>
        </Box>
        <Box alignSelf='center'>
          <Avatar className={classes.avatar}>
            <FontAwesomeIcon
              {...{
                icon: faSignOutAlt,
                size: '1x'
              }}
            />
          </Avatar>
        </Box>
      </Box>
    </Paper>
  )
}
