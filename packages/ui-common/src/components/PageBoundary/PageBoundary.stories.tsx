/* eslint-disable no-console */
import React from 'react'
import { Meta, Story } from '@storybook/react'

import { AuthenticationError } from '../../util/ResponseErrors'

import PageBoundary, { PageBoundaryProps } from './PageBoundary'

function NormalPage() {
  return <div>Normal page: rendered successfully!</div>
}

const throwError = true
function ErrorPage() {
  if (throwError) throw new TypeError('Something went wrong!')
  return <div>Error page: should trip error boundary.</div>
}

function AuthErrorPage() {
  if (throwError) throw new AuthenticationError({ message: 'Auth error!' })
  return <div>Authentication error page: should trip error boundary.</div>
}

const meta: Meta<PageBoundaryProps> = {
  title: 'PageBoundary',
  component: PageBoundary
}
export default meta

const Template: Story<PageBoundaryProps> = ({ children, ...args }) => <PageBoundary {...args}>{children}</PageBoundary>

export const NormalPageWhichRendersWithoutError = Template.bind({})
NormalPageWhichRendersWithoutError.storyName = 'Normal page which renders without error'
NormalPageWhichRendersWithoutError.args = {
  children: <NormalPage />
}

export const PageWhichThrowsTypeError = Template.bind({})
PageWhichThrowsTypeError.storyName = 'Page which throws TypeError'
PageWhichThrowsTypeError.args = {
  children: <ErrorPage />
}

export const PageWhichThrowsAuthenticationError = Template.bind({})
PageWhichThrowsAuthenticationError.storyName = 'Page which throws AuthenticationError'
PageWhichThrowsAuthenticationError.args = {
  children: <AuthErrorPage />
}
