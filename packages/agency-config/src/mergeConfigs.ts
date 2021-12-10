/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Merge config files.
 */
import { cloneDeep, merge } from 'lodash'

export enum ConfigEnvironments {
  'development' = 'development',
  'qa' = 'qa',
  'staging' = 'staging',
  'sandbox' = 'sandbox',
  'production' = 'production',
  'current' = 'current'
}
export type ConfigEnvironment = typeof ConfigEnvironments

// Check for externally configured environment. Dictates `loadConfig()` and `loadConfigs().current`
export const externalEnvironment: ConfigEnvironments = (process.env.REACT_APP_ENV || process.env.NODE_ENV) as any

// Immutably merge array of `configs` passed in for the specified `environmentName`.
// NOTE: the order of configs is vitally important!
// Output is a single typed, nested map of properties, with environment overrides merged in.
export function mergeConfigs(
  base_common: any,
  base_app: any,
  agency_common: any,
  agency_app: any,
  environmentName?: ConfigEnvironments
) {
  // Default to "external" environment if necessary
  const currentEnvironment =
    environmentName == null || environmentName === ConfigEnvironments.current ? externalEnvironment : environmentName
  if (!currentEnvironment) throw new TypeError('You must set REACT_APP_ENV or NODE_ENV before building')
  return [base_common, base_app, agency_common, agency_app].reduce((combined, config: any) => {
    const { environments, ...fileConfig } = config
    const environmentConfig = environments == null ? null : environments[currentEnvironment]
    return merge(combined, cloneDeep(fileConfig), cloneDeep(environmentConfig))
  }, {})
}
