import React, { useMemo, useState } from 'react'
import { Box, TextField, makeStyles, createStyles, AppBar, Toolbar, Button, Typography } from '@material-ui/core'
import { Build, Flight, GpsFixed, LocalTaxi, QueryBuilder } from '@material-ui/icons'
import { FilterDateTimePicker } from 'components'
import { GEOFENCE_IDS, vehicleEventMap } from 'lib/events'
import { UUID, VEHICLE_EVENT, VEHICLE_STATE } from '@mds-core/mds-types'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { uuid } from '@mds-core/mds-utils'
import { serviceTypeMap, transactionTypeMap, TRANSACTION_TYPE, vehicleStateMap_v1_1 } from 'lib/trip'
import { FlexCard, ChecklistInput, ChecklistOption, TimeRangePreset } from '@lacuna/ui-common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/pro-solid-svg-icons'
import { useGeographiesWithMetadata } from 'hooks'
import { DateTime, Duration, Interval } from 'luxon'
import { FilterState, SELECTABLE_FILTERS } from './types'

type SERVICE_TYPE = 'standard' | 'shared' | 'luxury'

const { providerMap } = AirportConsoleConfig
const useStyles = makeStyles(theme =>
  createStyles({
    accordion: {
      margin: theme.spacing(1)
    },
    appBar: {
      backgroundColor: theme.palette.background.paper,
      borderRight: `1px solid ${theme.palette.divider}`,
      width: 280
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: 280,
      height: '100%',
      borderRight: `1px solid ${theme.palette.divider}`
    },
    filterContainer: {
      '& > *': { marginTop: theme.spacing(1) },
      display: 'flex',
      'flex-direction': 'column',
      padding: theme.spacing(2)
    },
    formContainer: {
      height: 'calc(100vh - 64px)',
      overflow: 'scroll'
    },
    iconButton: {
      paddingBottom: 0
    },
    textFieldContainer: {
      width: '100%',
      padding: theme.spacing(1)
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: 280
    }
  })
)

const serviceTypeOptions = Object.entries(serviceTypeMap).map(entry => ({
  value: entry[0],
  title: entry[1].label,
  checked: false
}))

const transactionTypeOptions = Object.entries(transactionTypeMap).map(entry => ({
  value: entry[0],
  title: entry[1].label,
  checked: false
}))

const vehicleEventOptions = Object.entries(vehicleEventMap).map(entry => ({
  value: entry[0],
  title: entry[1].label,
  checked: false
}))

const vehicleStateOptions = Object.entries(vehicleStateMap_v1_1).map(entry => ({
  value: entry[0],
  title: entry[1].label,
  checked: false
}))

const FilterFlexCard = ({ title, icon, children }: { title: string; icon: JSX.Element; children: JSX.Element }) => {
  return (
    <FlexCard
      {...{
        title,
        icon
      }}
    >
      <Box style={{ padding: 16 }}>{children}</Box>
    </FlexCard>
  )
}

const filterIconMap: { [key: string]: JSX.Element } = {
  Provider: (
    <FontAwesomeIcon
      {...{
        icon: faCog,
        size: 'sm'
      }}
    />
  ),
  'Event Type': <Build fontSize='small' />,
  'Geofence ID': <GpsFixed fontSize='small' />,
  'Transaction Type': <Flight fontSize='small' />,
  'Service Type': <LocalTaxi fontSize='small' />
}

const useSelectFilterOptions = (filters: FilterState, onFiltersChange: (filters: FilterState) => void) => {
  const geographies = useGeographiesWithMetadata()

  const geographyOptions = useMemo(
    () => geographies.map(({ geography_id, name }) => ({ value: geography_id, title: name, checked: false })),
    [geographies]
  )

  return useMemo(
    () => ({
      provider_id: {
        title: 'Provider',
        options: Object.keys(providerMap).map(key => ({
          value: providerMap[key].provider_id as UUID,
          title: providerMap[key].provider_name,
          checked: filters.provider_id?.includes(providerMap[key].provider_id) ?? false
        })),
        onChange: (checkedItemIds: UUID[]) => {
          onFiltersChange({ ...filters, provider_id: checkedItemIds.length > 0 ? checkedItemIds : undefined })
        }
      },
      transaction_type: {
        title: 'Transaction Type',
        options: transactionTypeOptions.map(tt => {
          return { ...tt, checked: filters.transaction_type?.includes(tt.value as TRANSACTION_TYPE) ?? false }
        }),
        onChange: (checkedItemIds: string[]) => {
          onFiltersChange({
            ...filters,
            transaction_type: checkedItemIds.length > 0 ? (checkedItemIds as TRANSACTION_TYPE[]) : undefined
          })
        }
      },
      service_type: {
        title: 'Service Type',
        options: serviceTypeOptions.map(st => {
          return { ...st, checked: filters.service_type?.includes(st.value as SERVICE_TYPE) ?? false }
        }),
        onChange: (checkedItemIds: string[]) => {
          onFiltersChange({
            ...filters,
            service_type: checkedItemIds.length > 0 ? (checkedItemIds as SERVICE_TYPE[]) : undefined
          })
        }
      },
      vehicle_state: {
        title: 'Vehicle State',
        options: vehicleStateOptions.map(vs => {
          return { ...vs, checked: filters.vehicle_state?.includes(vs.value as VEHICLE_STATE) ?? false }
        }),
        onChange: (checkedItemIds: string[]) => {
          onFiltersChange({
            ...filters,
            vehicle_state: checkedItemIds.length > 0 ? (checkedItemIds as VEHICLE_STATE[]) : undefined
          })
        }
      },
      vehicle_event: {
        title: 'Event Type',
        options: vehicleEventOptions.map(ve => {
          return { ...ve, checked: filters.vehicle_event?.includes(ve.value as VEHICLE_EVENT) ?? false }
        }),
        onChange: (checkedItemIds: string[]) => {
          onFiltersChange({
            ...filters,
            vehicle_event: checkedItemIds.length > 0 ? (checkedItemIds as VEHICLE_EVENT[]) : undefined
          })
        }
      },
      geography_id: {
        title: 'Geography ID',
        options: geographyOptions.map(g => {
          return { ...g, checked: filters.geography_id?.includes(g.value) ?? false }
        }),
        onChange: (checkedItemIds: string[]) => {
          onFiltersChange({
            ...filters,
            ...{ geography_id: checkedItemIds.length > 0 ? (checkedItemIds as GEOFENCE_IDS[]) : undefined }
          })
        }
      }
    }),
    [filters, onFiltersChange, geographyOptions]
  )
}

export const FilterSideBar = ({
  filters,
  onToggleLive,
  useLive,
  onFiltersChange,
  onFiltersReset,
  enabledFilters,
  hideAppbar,
  minDate,
  maxDate,
  maxDuration
}: {
  filters: FilterState
  onToggleLive?: (useLive: boolean) => void
  useLive?: boolean
  onFiltersChange: (filters: FilterState) => void
  onFiltersReset: () => void
  enabledFilters: SELECTABLE_FILTERS[]
  hideAppbar?: boolean
  minDate?: DateTime
  maxDate?: DateTime
  maxDuration?: Duration
}) => {
  // keep datetime picker in sync when initialStartTime changes

  const classes = useStyles()
  const [keyPrefix, setKeyPrefix] = useState(uuid())
  const [textFieldValue, setTextFieldValue] = useState<string>('')

  const selectFilters = useSelectFilterOptions(filters, onFiltersChange)

  const onResetFilters = () => {
    onFiltersReset()
    setTextFieldValue('')
    setKeyPrefix(uuid()) // change child component key to reset child state
  }

  const onTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextFieldValue(event.target.value)
    onFiltersChange({ ...filters, ...{ vehicle_id: event.target.value } })
  }

  const setTimeFilter = (value: Interval | TimeRangePreset) => {
    onFiltersChange({ ...filters, ...{ time_range: value } })
  }

  return (
    <Box className={classes.container}>
      <AppBar
        elevation={1}
        position='sticky'
        className={classes.appBar}
        style={{ display: hideAppbar ? 'none' : undefined }}
      >
        <Toolbar variant='dense' className={classes.toolbar}>
          <Box display='flex'>
            <Button onClick={onResetFilters}>
              <Typography variant='subtitle2'>Clear All</Typography>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box className={classes.formContainer}>
        <form noValidate autoComplete='off' className={classes.filterContainer}>
          {enabledFilters.includes('vehicle_id') && (
            <Box className={classes.textFieldContainer}>
              <TextField
                fullWidth
                label='Enter License Plate'
                variant='outlined'
                onChange={onTextFieldChange}
                value={textFieldValue}
                InputProps={{ style: { height: '35px' } }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
          {enabledFilters.includes('time_range') && (
            <>
              <FilterFlexCard {...{ title: 'Time Range', icon: <QueryBuilder fontSize='small' /> }}>
                <FilterDateTimePicker
                  key={keyPrefix}
                  value={filters.time_range}
                  onChange={setTimeFilter}
                  onToggleLive={onToggleLive}
                  useLive={useLive}
                  minDate={minDate}
                  maxDate={maxDate}
                  maxDuration={maxDuration}
                  wrapInput={true}
                />
              </FilterFlexCard>
            </>
          )}
          {Object.entries(selectFilters).map(arr => {
            if (!enabledFilters.includes(arr[0] as SELECTABLE_FILTERS)) {
              return
            }
            const filter = arr[1]
            const flexCardKey = `flexcard-filter-${filter.title}`
            return (
              <ChecklistInput
                key={flexCardKey}
                title={filter.title}
                headerChildren={filterIconMap[filter.title]}
                checklistOptions={filter.options}
                onOptionsUpdated={(options: ChecklistOption<string>[]) => {
                  filter.onChange(options.filter(o => o.checked).map(m => m.value))
                }}
              ></ChecklistInput>
            )
          })}
        </form>
      </Box>
    </Box>
  )
}
