import React from 'react'
import { AppConfig, ServerUrls } from '../lib/config/types'

export type ConfigContextProviderProps = { config: AppConfig }

// Default settings if no context is provided by consumer app
const defaultConfig: { config: AppConfig } = {
  config: {
    app: {
      appName: 'ui-common',
      agencyDisplayName: 'LACUNA'
    },
    featureFlags: [],
    serverUrl: {} as ServerUrls
  }
}

// TODO - continue migrating app config settings here
/**
 * Context for app specific configuration settings
 */
const ConfigContext = React.createContext<ConfigContextProviderProps>(defaultConfig)

export const ConfigProvider: React.FunctionComponent<ConfigContextProviderProps> = ({ config, children }) => {
  const values = React.useMemo(() => ({ config }), [config])
  return <ConfigContext.Provider value={values}> {children} </ConfigContext.Provider>
}

export const useConfig = (): AppConfig => {
  const values = React.useContext(ConfigContext)
  if (values == null) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return { ...values.config }
}
