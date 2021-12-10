import React, { PropsWithChildren } from 'react'
import { Box, Typography } from '@material-ui/core'

interface TabPanelProps {
  index: number
  value: number
  className?: string
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}: PropsWithChildren<TabPanelProps>) => {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}
