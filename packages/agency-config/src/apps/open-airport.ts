/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * App loader for "current" environment for `open-airport` app
 * */
import { mergeConfigs } from '../mergeConfigs'

// Import all base configs
import base_common from '../base/common'
import base_app from '../base/open-airport'

// Pull current agency name from `REACT_APP_AGENCY`, set in `.env`
const agency = process.env.REACT_APP_AGENCY
if (!agency) throw new TypeError('REACT_APP_AGENCY is not defined:  try running `pnpm agency LADOT`')
const agency_common = require(`../${agency}/common`).default // eslint-disable-line import/no-dynamic-require
const agency_app = require(`../${agency}/open-airport`).default // eslint-disable-line import/no-dynamic-require

/**
 * Construct type from the `base_*` configs.
 * NOTE: We can't figure types out for the dynamic `agency_` configs,
 * so make sure all type variables are at least stubbed out in `base_common` and `base_app`.
 */
export type OpenAirportConfigType = Omit<typeof base_common & typeof base_app, 'environments'>

/**
 * Export merged config for the current 'environment' for ease of app import.
 * NOTE: specifying type is required type type config object in the app!
 */
export const AirportConsoleConfig: OpenAirportConfigType = mergeConfigs(
  base_common,
  agency_common,
  base_app,
  agency_app
)
