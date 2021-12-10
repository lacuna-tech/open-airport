/* eslint-disable no-console */
import React from 'react'
import { Meta, Story } from '@storybook/react'

import { createStoryProvider } from '../../util/storybook/store'
import { reducerMap } from '../../store/serverConfig/serverConfig'

import JurisdictionSelector, { JurisdictionSelectorProps } from './JurisdictionSelector'

const meta: Meta<JurisdictionSelectorProps> = {
  title: 'JurisdictionSelector',
  component: JurisdictionSelector
}
export default meta

// Create mock StoryProvider with just serverConfig.
// You'll pass current `state` in during each story below.
const StoryProvider = createStoryProvider(reducerMap)

// Redux state with some jurisdictions
const JURISDICTION_A = {
  jurisdiction_id: 'jurisdiction-a',
  agency_key: 'agency-a',
  agency_name: 'Agency A',
  geography_id: 'geo-a'
}
const JURISDICTION_B = {
  jurisdiction_id: 'jurisdiction-b',
  agency_key: 'agency-b',
  agency_name: 'Agency B',
  geography_id: 'geo-B'
}
const JURISDICTION_C = {
  jurisdiction_id: 'jurisdiction-c',
  agency_key: 'agency-c',
  agency_name: 'Agency C',
  geography_id: 'geo-C'
}

const NO_JURISDICTIONS = {
  serverConfig: {
    config: {
      organization: {},
      jurisdictions: []
    }
  }
}
const SINGLE_JURISDICTION = {
  serverConfig: {
    config: {
      organization: {
        jurisdiction: 'jurisdiction-a' // main jurisdiction_id
      },
      jurisdictions: [JURISDICTION_A]
    }
  }
}
const MULTIPLE_JURISDICTIONS = {
  serverConfig: {
    config: {
      organization: {
        jurisdiction: 'jurisdiction-a' // main jurisdiction_id
      },
      jurisdictions: [JURISDICTION_A, JURISDICTION_B, JURISDICTION_C]
    }
  }
}

const Template: Story<JurisdictionSelectorProps & { state?: Record<string, unknown> }> = ({ state, ...props }) => (
  <StoryProvider state={state}>
    <JurisdictionSelector {...props} />
  </StoryProvider>
)

export const NoJurisdictionsInState = Template.bind({})
NoJurisdictionsInState.args = {
  state: NO_JURISDICTIONS
}

export const SingleJurisdictionInState = Template.bind({})
SingleJurisdictionInState.args = {
  state: SINGLE_JURISDICTION
}

export const SingleJurisdictionInStateWithValue = Template.bind({})
SingleJurisdictionInStateWithValue.args = {
  state: SINGLE_JURISDICTION,
  value: 'jurisdiction-a'
}

export const WithUnknownLabel = Template.bind({})
WithUnknownLabel.args = {
  state: SINGLE_JURISDICTION,
  value: 'jurisdiction-b'
}

export const WithMultipleJurisdictionsInState = Template.bind({})
WithMultipleJurisdictionsInState.args = {
  state: MULTIPLE_JURISDICTIONS
}

export const WithMultipleJurisdictionsInStateValueSelected = Template.bind({})
WithMultipleJurisdictionsInStateValueSelected.args = {
  state: MULTIPLE_JURISDICTIONS,
  value: 'jurisdiction-b'
}

export const WithMultipleJurisdictionsInStateAndInvalidSelection = Template.bind({})
WithMultipleJurisdictionsInStateAndInvalidSelection.args = {
  state: MULTIPLE_JURISDICTIONS,
  value: 'jurisdiction-d'
}
