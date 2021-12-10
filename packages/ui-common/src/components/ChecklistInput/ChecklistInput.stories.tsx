import React, { useState } from 'react'
import AcUnit from '@material-ui/icons/AcUnit'
import Audiotrack from '@material-ui/icons/Audiotrack'
import Cancel from '@material-ui/icons/Cancel'
import CheckCircle from '@material-ui/icons/CheckCircle'
import { Meta, Story } from '@storybook/react'

import { ChecklistInput, ChecklistInputProps, ChecklistOption } from './ChecklistInput'

const meta: Meta<ChecklistInputProps<string>> = {
  title: 'ChecklistInput',
  component: ChecklistInput,
  decorators: [
    StoryComp => (
      <div style={{ width: 300 }}>
        <StoryComp />
      </div>
    )
  ],
  args: {
    title: 'basic options',
    showSelectAll: false,
    checklistOptions: [
      {
        value: 'firstValue',
        title: 'First option',
        checked: false
      },
      { value: 'secondValue', title: 'Second option', checked: false },
      { value: 'thirdValue', title: 'Third option', checked: false }
    ]
  }
}
export default meta

const Template: Story<ChecklistInputProps<string>> = ({
  onOptionsUpdated,
  checklistOptions: defaultChecklistOptions,
  ...args
}) => {
  const [checklistOptions, setChecklistOptions] = useState(defaultChecklistOptions)
  const handleClick = (options: ChecklistOption<string>[]) => {
    onOptionsUpdated(options)
    setChecklistOptions(options)
  }
  return <ChecklistInput {...args} checklistOptions={checklistOptions} onOptionsUpdated={handleClick} />
}

export const BasicWithControlledBehavior = Template.bind({})

const iconChecklistOptions: ChecklistOption<string>[] = [
  {
    value: 'firstValue',
    title: 'First option',
    checked: false,
    children: <AcUnit fontSize='small' />
  },
  { value: 'secondValue', title: 'Second option', checked: false, children: <Audiotrack fontSize='small' /> },
  { value: 'thirdValue', title: 'Third option', checked: false, children: <Cancel fontSize='small' /> }
]

export const WithContentIcons = Template.bind({})
WithContentIcons.args = {
  checklistOptions: iconChecklistOptions
}

export const WithHeaderIcon = Template.bind({})
WithHeaderIcon.args = {
  checklistOptions: iconChecklistOptions,
  icon: <CheckCircle />
}

export const WithManyOptionsOverflow = Template.bind({})
WithManyOptionsOverflow.args = {
  icon: <CheckCircle />,
  checklistOptions: [
    {
      value: '1',
      title: '1',
      checked: false
    },
    { value: '2', title: '2', checked: false },
    { value: '3', title: '3', checked: false },
    {
      value: '4',
      title: '4',
      checked: false
    },
    { value: '5', title: '6', checked: false },
    { value: '7', title: '7', checked: false },
    {
      value: '8',
      title: '8',
      checked: false
    },
    { value: '9', title: '9', checked: false },
    {
      value: '10',
      title: '10',
      checked: false
    },
    { value: '11', title: '11', checked: false },
    { value: '12', title: '12', checked: false },
    { value: '13', title: '13', checked: false },
    { value: '14', title: '14', checked: false },
    { value: '15', title: '15', checked: false },
    { value: '16', title: '16', checked: false }
  ]
}
