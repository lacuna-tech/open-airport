import React, { useMemo } from 'react'
import { LacunaApp, AuthAvatar, usePalette, ClickableContentProps } from '@lacuna/ui-common'
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { createAppTheme } from 'types/theme'
import { Logo } from 'components'
import { useOrganizationConfig } from 'store/config'
import * as luxon from 'luxon'
import pages from './pages/pages'

const {
  theme: {
    palette: { type: configuredPaletteType }
  },
  agency: { timezone },
  authentication
} = AirportConsoleConfig

window.authConfig = authentication

luxon.Settings.defaultZoneName = timezone

export default function App() {
  const [paletteType, onPaletteToggled] = usePalette(configuredPaletteType)
  const logoContent: ClickableContentProps = useMemo(() => ({ onClick }) => <Logo {...{ onClick }} />, [])

  // Load geographies with metadata
  // Ideally these can come from geography api directly at some point...
  useOrganizationConfig()

  return (
    <LacunaApp
      pages={pages}
      configFiles={['providers', 'organization']}
      theme={createAppTheme(paletteType)}
      loadJurisdictions
      topRight={<AuthAvatar />}
      title={'Open Airport'}
      logoContent={logoContent}
      maxContainerSize={false}
      {...{ paletteType, onPaletteToggled, requiredPermissions: [] }}
    />
  )
}
