import React from 'react'
import { Box, Chip } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { GeographyWithMetadata } from '../../store/geographies'

const useStyles = makeStyles(theme =>
  createStyles({
    chip: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  })
)

export const GeographyBadges = ({ geographies }: { geographies: GeographyWithMetadata[] }) => {
  const classes = useStyles()
  const color = 'primary'
  const size = 'small'
  return (
    <Box>
      {geographies.map(geo => (
        <Chip
          key={`geography_name_label_${geo.geography_id}`}
          {...{
            className: classes.chip,
            color,
            label: geo.name.toUpperCase(),
            size
          }}
        />
      ))}
    </Box>
  )
}
