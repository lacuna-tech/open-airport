import { useCallback, useState } from 'react'
import * as MapboxGL from 'mapbox-gl'
import { testIcon, testIcon2 } from '../images'

export const loadImages = ({ map, images }: { map: MapboxGL.Map; images: string[][] }) => {
  images.forEach(([label, src]) => {
    const img = new Image(10, 10)
    img.onload = () => map.addImage(label, img)
    img.src = src
  })
  return map
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMapRef(): [(node: any) => void] {
  const [, setMap] = useState<MapboxGL.Map>()

  const getMap = useCallback(
    node => {
      if (node) {
        const map = node.getMap() as MapboxGL.Map
        loadImages({
          map,
          images: [
            ['test-icon', testIcon],
            ['test-icon-2', testIcon2]
          ]
        })
        setMap(map)
      }
    },
    [setMap]
  )

  return [getMap]
}
