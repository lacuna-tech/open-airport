import { useMemo, useCallback } from 'react'
import { PaletteType, useMediaQuery } from '@material-ui/core'
import { useLocalStorage } from 'react-use'

export function usePalette(configuredPaletteType: PaletteType): [PaletteType, () => void] {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true })
  // eslint-disable-next-line no-console
  // By default let prefersDarkMode override any configured defaults, otherwise fallback to light.
  const defaultPaletteType: PaletteType = prefersDarkMode ? 'dark' : configuredPaletteType || 'light'
  // Store Palette Type in local storage, but only if explicitly set. Otherwise use default.
  const [localStoragePaletteType, setLocalStoragePaletteType] = useLocalStorage<PaletteType>('palette', undefined)

  const paletteType = useMemo(() => {
    return localStoragePaletteType || defaultPaletteType
  }, [defaultPaletteType, localStoragePaletteType])

  const handlePaletteToggled = useCallback(() => {
    setLocalStoragePaletteType(paletteType === 'light' ? 'dark' : 'light')
  }, [paletteType, setLocalStoragePaletteType])

  return [paletteType, handlePaletteToggled]
}
