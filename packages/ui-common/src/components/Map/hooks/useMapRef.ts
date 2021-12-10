import { useCallback, useState } from 'react'
import * as MapboxGL from 'mapbox-gl'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMapRef(): [(node: any) => void] {
  const [, setMap] = useState<MapboxGL.Map>()

  const getMap = useCallback(
    node => {
      if (node) {
        const map = node.getMap() as MapboxGL.Map
        setMap(map)
      }
    },
    [setMap]
  )

  return [getMap]
}
