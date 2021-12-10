/* eslint-disable no-console */
import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Form } from 'react-final-form'
import noop from 'lodash/noop'

import { reducer as reducerMap } from '../../store/geographies'
import { createStoryProvider } from '../../util/storybook/store'

import GeographiesSelect, { GeographiesSelectProps } from './GeographiesSelect'

const meta: Meta<GeographiesSelectProps> = {
  title: 'GeographiesSelect',
  component: GeographiesSelect,
  args: {
    label: 'Geography',
    name: 'geos'
  }
}
export default meta

// name: string // passed to <Field>
// allowNull?: boolean // passed to <Field>
// fieldProps?: Partial<FieldProps<any, any>> // optional object of random props pass to <Field>
// multiple?: boolean // passed to <TextField inputProps/>:

const GEOS_STATE = {
  geographies: {
    geographyMap: {
      'b4bcc213-4888-48ce-a33d-4dd6c3384bda': {
        geography_id: 'b4bcc213-4888-48ce-a33d-4dd6c3384bda',
        name: 'City of LA'
      },
      '12b3fcf5-22af-4b0d-a169-ac7ac903d3b9': {
        geography_id: '12b3fcf5-22af-4b0d-a169-ac7ac903d3b9',
        name: 'District 12'
      },
      'ec551174-f324-4251-bfed-28d9f3f473fc': {
        geography_id: 'ec551174-f324-4251-bfed-28d9f3f473fc',
        name: 'San Fernando Valley'
      },
      '4c2015c6-6702-48a6-ab58-94d963911182': {
        geography_id: '4c2015c6-6702-48a6-ab58-94d963911182',
        name: 'Non San Fernando Valley DAC'
      }
    }
  }
}

const StoryProvider = createStoryProvider(reducerMap)

const Template: Story<
  GeographiesSelectProps & { state?: Record<string, unknown>; initialValue?: string | string[] }
> = ({ initialValue, name, ...args }) => (
  <StoryProvider state={GEOS_STATE}>
    <Form
      onSubmit={noop}
      initialValues={{ [name]: initialValue }}
      render={() => <GeographiesSelect {...args} name={name} style={{ width: 500 }} />}
    />
  </StoryProvider>
)

export const SingleEmptyInitialValue = Template.bind({})
SingleEmptyInitialValue.args = {
  initialValue: ''
}

export const SingleWithInitialValue = Template.bind({})
SingleWithInitialValue.args = {
  initialValue: 'b4bcc213-4888-48ce-a33d-4dd6c3384bda'
}

export const MultipleInitialEmptyValue = Template.bind({})
MultipleInitialEmptyValue.args = {
  multiple: true,
  initialValue: ''
}

export const MultipleInitialEmptyArray = Template.bind({})
MultipleInitialEmptyArray.args = {
  multiple: true,
  initialValue: []
}

export const MultipleInitialNonEmptyArray = Template.bind({})
MultipleInitialNonEmptyArray.args = {
  multiple: true,
  initialValue: ['b4bcc213-4888-48ce-a33d-4dd6c3384bda']
}
