import React from 'react'
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup } from '@fortawesome/pro-solid-svg-icons'
import { Badge, Tab, Tabs, Tooltip, Theme } from '@material-ui/core'
import { AgencyKey, AirportDefinitionMap, AirportDefinition } from '@lacuna/agency-config'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor:
        theme.palette.type === 'light' ? theme.palette.custom.primary.lighter : theme.palette.custom.primary.darker,
      boxShadow: `inset 1px 0px 0px rgba(0,0,0,0.4), inset -1px 0px 0px rgba(0,0,0,0.4)`,
      '& button': {
        minWidth: 40
      }
    }
  })
)

const AirportBadge = withStyles(theme => ({
  root: {
    '& .MuiBadge-badge': {
      top: '10px',
      right: '110px',
      backgroundColor: theme.palette.action.active,
      color: theme.palette.getContrastText(theme.palette.action.active)
    }
  }
}))(Badge)

const StyledTab = withStyles(theme => ({
  root: {
    padding: 10,
    color: theme.palette.type === 'light' ? theme.palette.primary.dark : theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary,
      opacity: 1
    },
    '&$selected': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary
    }
  },
  selected: {
    // selected is needed, even when empty, to enable the selected bg color (from above) to actually override
  }
}))(props => <Tab {...props} />)

interface AirportTabsProps {
  airports: AirportDefinitionMap
  airport: AirportDefinition
  explicitAirport: AirportDefinition | undefined
  selectAllEnabled: boolean
  onAirportSelection: (agency_key: AgencyKey | undefined) => void
}

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`
  }
}

export const AirportNavTabs: React.FC<AirportTabsProps> = ({
  airports,
  airport,
  explicitAirport,
  selectAllEnabled,
  onAirportSelection
}: AirportTabsProps) => {
  const classes = useStyles()
  const offsetIndex = selectAllEnabled ? 1 : 0
  const selectedTab =
    selectAllEnabled && explicitAirport === undefined
      ? 0
      : Object.values(airports).indexOf(airports[airport.agency_key]) + offsetIndex

  const handleTabsChange = (event: React.ChangeEvent<unknown>, selectedIndex: number) => {
    onAirportSelection(
      selectAllEnabled && selectedIndex === 0
        ? undefined
        : Object.values(airports)[selectedIndex - offsetIndex].agency_key
    )
  }

  return (
    <Tabs className={classes.root} value={selectedTab} onChange={handleTabsChange} orientation='horizontal'>
      {selectAllEnabled && Object.keys(airports).length > 1 ? (
        <StyledTab
          {...{
            icon: (
              <Tooltip {...{ title: 'All' }}>
                <AirportBadge badgeContent={''}>
                  <FontAwesomeIcon
                    {...{
                      icon: faLayerGroup,
                      size: '2x'
                    }}
                  />
                </AirportBadge>
              </Tooltip>
            )
          }}
          {...a11yProps(0)}
        />
      ) : undefined}
      {Object.values(airports).map(({ name, icon }, i) => (
        <StyledTab
          key={name}
          {...{
            icon: (
              <Tooltip {...{ title: name }}>
                <AirportBadge badgeContent={name}>
                  <FontAwesomeIcon
                    {...{
                      icon,
                      size: '2x'
                    }}
                  />
                </AirportBadge>
              </Tooltip>
            ),
            ...a11yProps(i + offsetIndex)
          }}
        />
      ))}
    </Tabs>
  )
}
