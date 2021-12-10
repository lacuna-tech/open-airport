import React from 'react'
import Typography from '@material-ui/core/Typography'
import { Meta, Story } from '@storybook/react'

const meta: Meta<Record<string, never>> = {
  title: 'Config View'
}
export default meta

export const Basic: Story<Record<string, never>> = () => (
  <div>
    <Typography variant='h1' component='h2' gutterBottom>
      h1. Heading
    </Typography>
  </div>
)
