import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { PageLayout2Panel } from './PageLayout-2Panel'

it('renders content provided by props', () => {
  const children = (
    <div>
      <div>Child Element 1</div>
      <div>Child Element 2</div>
    </div>
  )
  const rightContent = (
    <div>
      <div>Right Content 1</div>
      <div>Right Content 2</div>
    </div>
  )
  const headerContent = (
    <div>
      <div>Header Content 1</div>
      <div>Header Content 2</div>
    </div>
  )
  render(
    <PageLayout2Panel rightContent={rightContent} headerContent={headerContent}>
      {children}
    </PageLayout2Panel>
  )
  expect(screen.getByText('Child Element 1')).toBeVisible()
  expect(screen.getByText('Child Element 2')).toBeVisible()
  expect(screen.getByText('Right Content 1')).toBeVisible()
  expect(screen.getByText('Right Content 2')).toBeVisible()
  expect(screen.getByText('Header Content 1')).toBeVisible()
  expect(screen.getByText('Header Content 2')).toBeVisible()
})

it('renders right content with overflow: auto by default', () => {
  const children = (
    <div>
      <div>Child Element 1</div>
      <div>Child Element 2</div>
    </div>
  )
  const rightContent = (
    <div>
      <div>Right Content 1</div>
      <div>Right Content 2</div>
    </div>
  )
  const headerContent = (
    <div>
      <div>Header Content 1</div>
      <div>Header Content 2</div>
    </div>
  )
  const { container } = render(
    <PageLayout2Panel rightContent={rightContent} headerContent={headerContent}>
      {children}
    </PageLayout2Panel>
  )

  expect(container.children[0].children[0].children[1]).toHaveStyle('overflow: scroll')
})

it('renders right content without overflow: scroll when prop is provided', () => {
  const children = (
    <div>
      <div>Child Element 1</div>
      <div>Child Element 2</div>
    </div>
  )
  const rightContent = (
    <div>
      <div>Right Content 1</div>
      <div>Right Content 2</div>
    </div>
  )
  const headerContent = (
    <div>
      <div>Header Content 1</div>
      <div>Header Content 2</div>
    </div>
  )
  const { container } = render(
    <PageLayout2Panel rightContent={rightContent} headerContent={headerContent} mainContentOverflow={false}>
      {children}
    </PageLayout2Panel>
  )

  expect(container.children[0].children[0].children[1]).toHaveStyle('overflow: none')
})
