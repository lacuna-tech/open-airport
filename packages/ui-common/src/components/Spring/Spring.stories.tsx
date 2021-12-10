/* eslint-disable no-console */
import React from 'react'
import { Button, Toolbar } from '@material-ui/core'
import { Meta, Story } from '@storybook/react'

import Spring from './Spring'

const meta: Meta<Record<string, never>> = {
  title: 'Spring',
  component: Spring
}
export default meta

export const InsideToolbar: Story<Record<string, never>> = () => (
  <Toolbar variant='dense'>
    <Button type='reset'>Left</Button>
    <Spring />
    <Button type='submit'>Right</Button>
  </Toolbar>
)
