import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'

interface StyleProps {
  spacing: number
}

const useStyles = makeStyles(
  theme =>
    createStyles({
      root: ({ spacing }: StyleProps) => ({
        maxWidth: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: -theme.spacing(spacing) / 2,
        listStyle: 'none',
        padding: 0
      }),
      entry: ({ spacing }: StyleProps) => ({
        flex: '0 1 0%',
        padding: theme.spacing(spacing)
      })
    }),
  {
    name: 'FlexGrid'
  }
)

export enum ListType {
  NONE = 'none',
  ORDERED = 'ordered',
  UNORDERED = 'unordered'
}

const containerTagFromListType = (listType: ListType): 'div' | 'ol' | 'ul' => {
  switch (listType) {
    case ListType.NONE:
      return 'div'
    case ListType.ORDERED:
      return 'ol'
    case ListType.UNORDERED:
      return 'ul'
    default:
      throw new Error(`unexpected list type ${listType}`)
  }
}

const entryTagFromListType = (listType: ListType): 'div' | 'li' => {
  switch (listType) {
    case ListType.NONE:
      return 'div'
    case ListType.ORDERED:
    case ListType.UNORDERED:
      return 'li'
    default:
      throw new Error(`unexpected list type ${listType}`)
  }
}

export interface FlexGridProps {
  listType?: ListType
  spacing?: number
  children: React.ReactNode[]
}

export const FlexGrid: React.FunctionComponent<FlexGridProps> = ({
  listType = ListType.NONE,
  spacing = 2,
  children
}) => {
  const ContainerTag = containerTagFromListType(listType)
  const EntryTag = entryTagFromListType(listType)

  const classes = useStyles({ spacing })
  return (
    <ContainerTag className={classes.root}>
      {React.Children.map(children, child => (
        <EntryTag className={classes.entry}>{child}</EntryTag>
      ))}
    </ContainerTag>
  )
}
