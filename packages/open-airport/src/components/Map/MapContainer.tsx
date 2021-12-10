import React, { useCallback, useState } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Paper, Backdrop } from '@material-ui/core'
import { useMeasure } from 'react-use'
import { CenteredLoadingSpinner } from '@lacuna/ui-common'
import { Dimensions } from 'components'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      position: 'relative'
    },
    backdrop: {
      position: 'absolute',
      left: 'auto',
      top: 'auto',
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff'
    }
  })
)

export const MapContainer = ({
  dependenciesLoading,
  children
}: {
  dependenciesLoading?: boolean
  children: (onMapLoaded: () => void, dimensions: Dimensions) => JSX.Element
}) => {
  const classes = useStyles()
  const [getContainerElement, { width, height }] = useMeasure()
  const [mapLoading, setMapLoading] = useState<boolean>(true)

  const handleMapLoaded = useCallback(() => {
    setMapLoading(false)
  }, [])

  const loading = mapLoading || dependenciesLoading

  return (
    <Paper className={classes.root} ref={getContainerElement}>
      {width && height && (
        <>
          {loading && (
            <Backdrop className={classes.backdrop} open={loading} style={{ width, height }}>
              <CenteredLoadingSpinner />
            </Backdrop>
          )}
          {children(handleMapLoaded, { width, height })}
        </>
      )}
    </Paper>
  )
}
