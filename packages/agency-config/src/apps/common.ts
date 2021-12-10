/* eslint-disable @typescript-eslint/no-var-requires */
import { mergeConfigs } from '../mergeConfigs'

// Import all base configs
import base_common from '../base/common'

// Pull current agency name from `REACT_APP_AGENCY`, set in `.env`
const agency = process.env.REACT_APP_AGENCY
if (!agency) throw new TypeError('REACT_APP_AGENCY is not defined:  try running `pnpm agency LADOT`')

const agency_common = require(`../${agency}/common`).default // eslint-disable-line import/no-dynamic-require

/**
 * Construct type from the `base_*` configs.
 * NOTE: We can't figure types out for the dynamic `agency_` configs,
 * so make sure all type variables are at least stubbed out in `base_common` and `base_app`.
 */
export type CommonConfigType = Omit<typeof base_common, 'environments'>

/**
 * Export merged config for the current 'environment' for ease of app import.
 * NOTE: specifying type is required type type config object in the app!
 */
export const CommonConfig: CommonConfigType = mergeConfigs(base_common, agency_common, {}, {})
