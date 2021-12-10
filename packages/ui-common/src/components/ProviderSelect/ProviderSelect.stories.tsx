/* eslint-disable no-console */
import React from 'react'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { Form } from 'react-final-form'

import { createStoryProvider } from '../../util/storybook/store'
import { reducerMap } from '../../store/serverConfig/serverConfig'
import ProviderSelect, { ProviderSelectProps } from './ProviderSelect'

// Create mock StoryProvider with just serverConfig.
// You'll pass current `state` in during each story below.
const StoryProvider = createStoryProvider(reducerMap)
const PROVIDERS_STATE = {
  serverConfig: {
    config: {
      providers: [
        {
          provider_name: 'Chirp',
          provider_id: '2411d395-04f2-47c9-ab66-d09e9e3c3251'
        },
        {
          provider_name: 'Dryft',
          provider_id: 'e714f168-ce56-4b41-81b7-0b6a4bd26128'
        },
        {
          provider_name: 'Pump',
          provider_id: 'c20e08cf-8488-46a6-a66c-5d8fb827f7e0'
        },
        {
          provider_name: 'Lazor',
          provider_id: '6ddcc0ad-1d66-4046-bba4-d1d96bb8ca4d'
        },
        {
          provider_name: 'Thyme',
          provider_id: '63f13c48-34ff-49d2-aca7-cf6a5b6171c3'
        },
        {
          provider_name: 'Twirl',
          provider_id: '70aa475d-1fcd-4504-b69c-2eeb2107f7be'
        }
      ]
    }
  }
}

const meta: Meta<ProviderSelectProps> = {
  title: 'ProviderSelect',
  decorators: [
    StoryComp => (
      <StoryProvider state={PROVIDERS_STATE}>
        <StoryComp />
      </StoryProvider>
    )
  ],
  args: {
    name: 'provider',
    label: 'Provider'
  }
}
export default meta

const Template: Story<ProviderSelectProps & { initialValue?: string | string[] }> = ({
  initialValue = '',
  name,
  ...props
}) => (
  <Form
    onSubmit={noop}
    initialValues={{ [name]: initialValue }}
    render={() => <ProviderSelect {...props} name={name} style={{ width: 300 }} />}
  />
)

export const SingleEmptyInitialValue = Template.bind({})

export const SingleWithInitialValue = Template.bind({})
SingleWithInitialValue.args = {
  initialValue: '2411d395-04f2-47c9-ab66-d09e9e3c3251'
}

export const MultipleEmptyInitialValue = Template.bind({})
MultipleEmptyInitialValue.args = {
  multiple: true
}

export const MultipleEmptyArrayInitialValue = Template.bind({})
MultipleEmptyArrayInitialValue.args = {
  multiple: true,
  initialValue: []
}

export const MultipleNonEmptyArrayInitialValue = Template.bind({})
MultipleNonEmptyArrayInitialValue.args = {
  multiple: true,
  initialValue: ['2411d395-04f2-47c9-ab66-d09e9e3c3251']
}
