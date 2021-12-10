import React from 'react'
import { Meta, Story } from '@storybook/react'

import Message, { MessageProps } from './Message'

const meta: Meta<MessageProps> = {
  title: 'Message',
  component: Message,
  args: {
    variant: 'success',
    message: 'Message here'
  }
}
export default meta

const Template: Story<MessageProps> = args => <Message {...args} />

export const Error = Template.bind({})
Error.args = {
  variant: 'error'
}

export const Warning = Template.bind({})
Warning.args = {
  variant: 'warning'
}

export const Info = Template.bind({})
Info.args = {
  variant: 'info'
}

export const Success = Template.bind({})
Success.args = {
  variant: 'success'
}

export const WithDescription = Template.bind({})
WithDescription.args = {
  description: 'Description here'
}
