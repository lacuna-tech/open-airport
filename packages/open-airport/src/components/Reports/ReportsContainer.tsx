import React, { useState } from 'react'
import { Box, FormControl, Input, ListItemText, MenuItem, Paper, PopoverOrigin, Select } from '@material-ui/core'
import { FilterState, GRAPH_TYPE, ReportChartSwitcher, TIME_COMPARATOR_TYPE } from 'components'
import { CHART_TYPE } from './types'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  },
  MenuListProps: {
    autoFocus: false,
    autoFocusItem: false
  },
  getContentAnchorEl: undefined,
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left'
  } as PopoverOrigin
}

export const ReportsContainer = ({
  selectedChart,
  selectedGraph,
  filterState,
  onSelectedGraphChange
}: {
  selectedChart: CHART_TYPE
  selectedGraph: GRAPH_TYPE
  filterState: FilterState
  onSelectedGraphChange: (event: React.ChangeEvent<{ value: unknown }>) => void
}) => {
  const [selectedTimeComparator, setSelectedTimeComparator] = useState<TIME_COMPARATOR_TYPE>('today_yesterday')

  const onSelectedTimeComparatorChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedTimeComparator(event.target.value as TIME_COMPARATOR_TYPE)
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box>
        {selectedChart !== 'table' && (
          <FormControl style={{ minWidth: 120, maxWidth: '300px', marginTop: 0, padding: 16 }}>
            <Select
              labelId='demo-mutiple-checkbox-label'
              id='demo-mutiple-checkbox'
              value={selectedGraph}
              onChange={onSelectedGraphChange}
              input={<Input />}
              MenuProps={MenuProps}
            >
              <MenuItem value={'pudo_vs_enter_exit'}>
                <ListItemText primary='PUDO vs Enter/Exit' />
              </MenuItem>
              <MenuItem value={'events_by_type'}>
                <ListItemText primary='Events by Type' />
              </MenuItem>
              <MenuItem value={'vehicle_state_by_type'}>
                <ListItemText primary='Vehicle State by Type' />
              </MenuItem>
              <MenuItem value={'total_trips'}>
                <ListItemText primary='Total Trips' />
              </MenuItem>
              <MenuItem value={'total_fees'}>
                <ListItemText primary='Total Fees' />
              </MenuItem>
              <MenuItem value={'average_connect_time'}>
                <ListItemText primary='Average Connect Time' />
              </MenuItem>
              <MenuItem value={'average_dwell_time'}>
                <ListItemText primary='Average Dwell Time' />
              </MenuItem>
            </Select>
          </FormControl>
        )}
        {selectedChart === 'bar' && (
          <FormControl style={{ minWidth: 120, maxWidth: '340px', marginTop: 0, padding: 16 }}>
            <Select
              labelId='demo-mutiple-checkbox-label'
              id='demo-mutiple-checkbox'
              value={selectedTimeComparator}
              onChange={onSelectedTimeComparatorChange}
              input={<Input />}
              MenuProps={MenuProps}
            >
              <MenuItem value={'today_yesterday'}>
                <ListItemText primary='Today vs Yesterday' />
              </MenuItem>
              <MenuItem value={'today_last_week'}>
                <ListItemText primary='Today vs Same Day Last Week' />
              </MenuItem>

              <MenuItem value={'hour_last_week'}>
                <ListItemText primary='Current Hour vs Same Hour Last Week' />
              </MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
      <Paper style={{ margin: 16, flexGrow: 1 }}>
        <Box style={{ height: 700, width: '100%', paddingTop: 16, paddingBottom: 0 }}>
          <ReportChartSwitcher
            {...{
              chartType: selectedChart,
              selectedGraph,
              selectedTimeComparator,
              filterState
            }}
          />
        </Box>
      </Paper>
    </Box>
  )
}
