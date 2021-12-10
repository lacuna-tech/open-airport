import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { MemoryRouter, useHistory, useLocation } from 'react-router'

import { NavigateAwayWarning } from './NavigateAwayWarning'

const NavigateAwayExample: React.FunctionComponent = ({ children }) => {
  const location = useLocation()
  const history = useHistory()
  const [counter, setCounter] = React.useState(1)
  return (
    <div>
      <label>
        Location: <input readOnly value={location.pathname} />
      </label>
      <button
        onClick={() => {
          setCounter(c => c + 1)
          history.push(`/somewhere${counter}`)
        }}
      >
        navigate away
      </button>
      {children}
    </div>
  )
}

const meta: ComponentMeta<typeof NavigateAwayWarning> = {
  title: 'NavigateAwayWarning',
  component: NavigateAwayWarning,
  decorators: [
    Story => (
      <NavigateAwayExample>
        <Story />
      </NavigateAwayExample>
    ),
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ]
}
export default meta

const Template: ComponentStory<typeof NavigateAwayWarning> = args => <NavigateAwayWarning {...args} />

export const Default = Template.bind({})
Default.args = {}

export const Disabled = Template.bind({})
Disabled.args = { disable: true }
