// Export utility methods
export * from './mergeConfigs'
export * from './base'

// Export common agency config.  Contains no app config
export { CommonConfig } from './apps/common'

// Export each app's "current" config as per `REACT_APP_ENV` and `REACT_APP_AGENCY`
export { AirportConsoleConfig } from './apps/open-airport'
