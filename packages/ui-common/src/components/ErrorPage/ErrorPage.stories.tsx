/* eslint-disable no-console */
import React from 'react'
import { Meta, Story } from '@storybook/react'

import { AuthenticationError } from '../../util/ResponseErrors'

import ErrorPage, { ErrorPageProps } from './ErrorPage'

const meta: Meta<ErrorPageProps> = {
  title: 'ErrorPage',
  component: ErrorPage
}
export default meta

const Template: Story<ErrorPageProps> = args => <ErrorPage {...args} />

export const DefaultErrorPageWithNoErrorParameter = Template.bind({})

export const DefaultErrorPageWithTypeError = Template.bind({})
DefaultErrorPageWithTypeError.args = {
  error: new TypeError('No good!')
}

export const DefaultErrorPageWithAuthenticationError = Template.bind({})
DefaultErrorPageWithAuthenticationError.args = {
  error: new AuthenticationError({ message: 'You are not authorized.' })
}

export const CustomTitleTextErrorPageNoErrorParameter = Template.bind({})
CustomTitleTextErrorPageNoErrorParameter.args = {
  title: 'Custom title, no error',
  text: 'Custom Text\nWith returns'
}

export const CustomTitleTextErrorPageWithTypeError = Template.bind({})
CustomTitleTextErrorPageWithTypeError.args = {
  error: new TypeError('No good!'),
  title: 'Custom title, with TypeError',
  text: 'Custom Text\nWith returns'
}

export const CustomTitleTextErrorPageWithAuthenticationError = Template.bind({})
CustomTitleTextErrorPageWithAuthenticationError.args = {
  error: new AuthenticationError({ message: 'You are not authorized.' }),
  title: 'Custom title, with AuthenticationError',
  text: 'Custom Text\nWith returns'
}
