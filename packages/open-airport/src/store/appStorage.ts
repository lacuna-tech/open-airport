/**
 * Create localStorage preferences specific to this app / agency.
 * Used by store_utils to persist data across loads.
 */
import { AirportConsoleConfig } from '@lacuna/agency-config'
import { AppStorage } from '@lacuna/ui-common'

const APP_KEY = `${AirportConsoleConfig._agency}-${AirportConsoleConfig._app}`
export default new AppStorage(APP_KEY)
