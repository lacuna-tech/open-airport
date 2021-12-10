import { DecoratorFn, Parameters } from '@storybook/react'

import { withBase } from '../src/storybook/decorators'

const newViewports = {
  standardDesktop: {
    name: 'Standard Desktop (1920x1080)',
    styles: { width: '1920px', height: '1080px' },
    type: 'desktop'
  },
  standardLaptop: {
    name: 'Standard Laptop (1366x768)',
    styles: { width: '1366px', height: '768px' },
    type: 'desktop'
  }
}

export const parameters: Parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  viewport: {
    viewports: { ...newViewports }
  }
}

export const decorators: DecoratorFn[] = [withBase]
