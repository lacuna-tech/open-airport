import { AgencyKey } from '@lacuna/agency-config'
import { Jurisdiction, LoadState } from '@lacuna/ui-common'
import { Geography, Timestamp } from '@mds-core/mds-types'

export type ConfigJurisdiction = Omit<Jurisdiction, 'geography'> & {
  geographies: Geography[]
  timestamp: Timestamp
}

export type OrganizationConfig = {
  agencies: string[]
  agency_key: AgencyKey
  currency: string
  jurisdictions: ConfigJurisdiction[]
  locale: string
  name: string
  timezone: string
}

export type OrganizationsConfigResponse = OrganizationConfig[]
export type ConfigMap = { [key: string]: OrganizationConfig }

export enum ConfigActions {
  LOAD_ORGANIZATION_CONFIG = 'load-organization-config',
  LOAD_ORGANIZATION_CONFIG_SUCCESS = 'load-organization-config-success',
  LOAD_ORGANIZATION_CONFIG_FAILED = 'load-organization-config-failed'
}

export type LoadOrgConfigAction = { type: ConfigActions.LOAD_ORGANIZATION_CONFIG }
export type LoadOrgConfigFailedAction = { type: ConfigActions.LOAD_ORGANIZATION_CONFIG_FAILED }
export type LoadOrgConfigSuccessAction = {
  type: ConfigActions.LOAD_ORGANIZATION_CONFIG_SUCCESS
  data: OrganizationConfig[]
}

export type LoadConfigActions = LoadOrgConfigAction | LoadOrgConfigSuccessAction | LoadOrgConfigFailedAction

export type OrganizationConfigState = {
  loaded: LoadState
}

export type ConfigReducerState = {
  organizationConfigState: OrganizationConfigState
}

export const getInitialState: () => OrganizationConfigState = () => ({ loaded: LoadState.unloaded })
