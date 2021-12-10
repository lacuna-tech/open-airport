import React from 'react'
import { Box, Paper } from '@material-ui/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { FlexGrid } from './FlexGrid'

const meta: ComponentMeta<typeof FlexGrid> = {
  title: 'layout/FlexGrid',
  component: FlexGrid
}
export default meta

const ExampleEntry: React.FunctionComponent = ({ children }) => (
  <Paper>
    <Box padding={4} width={300} height={300}>
      {children}
    </Box>
  </Paper>
)

const Template: ComponentStory<typeof FlexGrid> = args => (
  <FlexGrid {...args}>
    <ExampleEntry>One</ExampleEntry>
    <ExampleEntry>Two</ExampleEntry>
    <ExampleEntry>Three</ExampleEntry>
    <ExampleEntry>Four</ExampleEntry>
    <ExampleEntry>Five</ExampleEntry>
    <ExampleEntry>Six</ExampleEntry>
  </FlexGrid>
)

export const Default = Template.bind({})
