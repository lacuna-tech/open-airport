import React from 'react'
import { Box, Checkbox, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

import { FilterCard } from '../FilterCard'

const useStyles = makeStyles<Theme, { showSelectAll?: boolean }>((theme: Theme) =>
  createStyles({
    list: {
      margin: theme.spacing(-1, 0)
    },
    listItem: {
      padding: theme.spacing(1, 0, 1, 0),
      backgroundColor: theme.palette.background.paper
    },
    listItemDense: {
      padding: '2px 1px 2px 1px'
    },
    listItemIcon: {
      minWidth: 0,
      height: 20
    },
    optionContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    },
    allOptionsContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      paddingBottom: theme.spacing(1)
    },
    checklistCardContent: {
      flex: 1,
      overflow: 'auto',
      height: '100%',
      padding: theme.spacing(2, 3, 2, 3),
      '&:last-child': { paddingBottom: theme.spacing(2), paddingTop: props => (props.showSelectAll ? 0 : undefined) }
    },
    selectAll: {
      padding: 0,
      marginBottom: theme.spacing(1)
    }
  })
)

export type ChecklistOption<T> = {
  title: string
  value: T
  checked: boolean
  children?: JSX.Element
}

export type ChecklistInputProps<T> = {
  title: string
  checklistOptions: ChecklistOption<T>[]
  icon?: React.ReactNode
  showSelectAll?: boolean
  headerChildren?: React.ReactNode
  onOptionsUpdated: (updatedOptions: ChecklistOption<T>[]) => void
}

export const ChecklistInput = <T extends string>({
  title,
  checklistOptions,
  icon,
  showSelectAll,
  onOptionsUpdated
}: ChecklistInputProps<T>) => {
  const classes = useStyles({ showSelectAll })

  const toggleAllOptons = () => {
    const allOptionsChecked = checklistOptions.every(option => option.checked)
    const updatedOptions = checklistOptions.map(option => ({ ...option, checked: !allOptionsChecked }))
    return onOptionsUpdated(updatedOptions)
  }
  const getAllOptionsCheckedStatus = () => {
    return checklistOptions.every(option => option.checked)
  }

  return (
    <FilterCard header={title} icon={icon} classesOverride={{ cardContent: classes.checklistCardContent }}>
      <List className={classes.list} disablePadding>
        {showSelectAll && (
          <ListSubheader className={classes.selectAll}>
            <ListItem className={classes.listItem} dense onClick={toggleAllOptons} divider>
              <Box className={classes.allOptionsContainer}>
                <ListItemIcon className={classes.listItemIcon}>
                  <Checkbox
                    {...{
                      edge: 'start',
                      checked: getAllOptionsCheckedStatus(),
                      size: 'small',
                      disableRipple: true,
                      color: 'primary'
                    }}
                  />
                </ListItemIcon>
                <ListItemText {...{ primary: 'ALL' }} />
              </Box>
            </ListItem>
          </ListSubheader>
        )}

        {checklistOptions.map(option => {
          return (
            <ListItem key={option.value} className={classes.listItemDense} dense>
              <Box className={classes.optionContainer}>
                <ListItemIcon className={classes.listItemIcon}>
                  <Checkbox
                    {...{
                      color: 'primary',
                      edge: 'start',
                      checked: option.checked,
                      size: 'small',
                      disableRipple: true,
                      onChange: (event, checked) => {
                        const updatedOptions = checklistOptions.map(existingOption => {
                          if (existingOption.value === option.value) {
                            return { ...existingOption, checked }
                          }
                          return existingOption
                        })
                        onOptionsUpdated(updatedOptions)
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText {...{ primary: option.title }} />
                {option.children}
              </Box>
            </ListItem>
          )
        })}
      </List>
    </FilterCard>
  )
}
