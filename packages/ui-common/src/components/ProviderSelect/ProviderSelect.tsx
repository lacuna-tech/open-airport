import React, { useMemo } from 'react'
import ChipSelect, { ChipSelectProps } from '../ChipSelect/ChipSelect'

import { serverConfig } from '../../store'

export type ProviderSelectProps = Omit<ChipSelectProps, 'options'>
export default function ProviderSelect(props: ProviderSelectProps) {
  const providers = serverConfig.selectors.useProviders()
  return useMemo(() => {
    if (!providers) {
      return <ChipSelect options={[{ label: 'Unknown Provider', value: 'unknown_provider' }]} {...props} />
    }

    const providerOptions = providers.map(({ provider_id, provider_name }) => {
      return { value: provider_id, label: provider_name }
    })
    return <ChipSelect options={providerOptions} {...props} />
  }, [props, providers])
}
