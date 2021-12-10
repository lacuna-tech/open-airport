import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import { Meta, Story } from '@storybook/react'

import { AutocompleteInput, AutocompleteInputProps, AutocompleteOption } from './AutocompleteInput'

const meta: Meta<AutocompleteInputProps> = {
  title: 'Inputs/AutocompleteInput',
  component: AutocompleteInput,
  decorators: [
    StoryComp => (
      <Box style={{ width: 300 }}>
        <StoryComp />
      </Box>
    )
  ],
  args: {
    label: 'Really Cool Input',
    options: [
      { label: 'All', value: 'all' },
      {
        label: 'Option 1',
        value: 'option1'
      },
      {
        label: 'Option 2',
        value: 'option2'
      }
    ]
  }
}
export default meta

const Template: Story<Omit<AutocompleteInputProps, 'selectedOptions'>> = ({ onChange, ...args }) => {
  const [selectedOptions, setSelectedOptions] = useState<AutocompleteOption[]>([])
  return (
    <AutocompleteInput
      {...args}
      selectedOptions={selectedOptions}
      onChange={updatedOptions => {
        onChange?.(updatedOptions)
        setSelectedOptions(updatedOptions)
      }}
    />
  )
}

export const Default = Template.bind({})

export const ManyOptions = Template.bind({})
ManyOptions.args = {
  options: [
    {
      label: 'Option 0',
      value: 'option_0'
    },
    {
      label: 'Option 1',
      value: 'option_1'
    },
    {
      label: 'Option 2',
      value: 'option_2'
    },
    {
      label: 'Option 3',
      value: 'option_3'
    },
    {
      label: 'Option 4',
      value: 'option_4'
    },
    {
      label: 'Option 5',
      value: 'option_5'
    },
    {
      label: 'Option 6',
      value: 'option_6'
    },
    {
      label: 'Option 7',
      value: 'option_7'
    },
    {
      label: 'Option 8',
      value: 'option_8'
    },
    {
      label: 'Option 9',
      value: 'option_9'
    },
    {
      label: 'Option 10',
      value: 'option_10'
    },
    {
      label: 'Option 11',
      value: 'option_11'
    },
    {
      label: 'Option 12',
      value: 'option_12'
    },
    {
      label: 'Option 13',
      value: 'option_13'
    },
    {
      label: 'Option 14',
      value: 'option_14'
    },
    {
      label: 'Option 15',
      value: 'option_15'
    },
    {
      label: 'Option 16',
      value: 'option_16'
    },
    {
      label: 'Option 17',
      value: 'option_17'
    },
    {
      label: 'Option 18',
      value: 'option_18'
    },
    {
      label: 'Option 19',
      value: 'option_19'
    },
    {
      label: 'Option 20',
      value: 'option_20'
    },
    {
      label: 'Option 21',
      value: 'option_21'
    },
    {
      label: 'Option 22',
      value: 'option_22'
    },
    {
      label: 'Option 23',
      value: 'option_23'
    },
    {
      label: 'Option 24',
      value: 'option_24'
    }
  ]
}
