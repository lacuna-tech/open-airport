import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router'
import { NavBreadcrumbs } from './NavBreadcrumbs'

const renderWithRouter = (comp: React.ReactElement) => {
  const history = createMemoryHistory({ initialEntries: ['/'] })
  render(comp, { wrapper: ({ children }) => <Router history={history}>{children}</Router> })
  return {
    history
  }
}

it('displays the current link title', () => {
  renderWithRouter(<NavBreadcrumbs currentLinkTitle='Current Link' />)

  expect(screen.getByText('Current Link')).toBeVisible()
})

it('displays all passed-in breadcrumbs when below maxItems', () => {
  renderWithRouter(
    <NavBreadcrumbs
      maxItems={3}
      breadcrumbs={[
        {
          title: 'Link 1',
          href: '/link-1'
        },
        {
          title: 'Link 2',
          href: '/link-2'
        }
      ]}
      currentLinkTitle='Current Link'
    />
  )

  expect(screen.getByText('Link 1')).toBeVisible()
  expect(screen.getByText('Link 2')).toBeVisible()
  expect(screen.getByText('Current Link')).toBeVisible()
})

it('triggers client-side navigation when link is clicked', () => {
  const { history } = renderWithRouter(
    <NavBreadcrumbs
      maxItems={3}
      breadcrumbs={[
        {
          title: 'Link 1',
          href: '/link-1'
        },
        {
          title: 'Link 2',
          href: '/link-2'
        }
      ]}
      currentLinkTitle='Current Link'
    />
  )

  userEvent.click(screen.getByRole('link', { name: 'Link 2' }))

  expect(history.location.pathname).toEqual('/link-2')
})

it('assigns correct href attribute to breadcrumbs', () => {
  renderWithRouter(
    <NavBreadcrumbs
      maxItems={3}
      breadcrumbs={[
        {
          title: 'Link 1',
          href: '/link-1'
        },
        {
          title: 'Link 2',
          href: '/link-2'
        }
      ]}
      currentLinkTitle='Current Link'
    />
  )

  expect(screen.getByRole('link', { name: 'Link 1' })).toHaveAttribute('href', '/link-1')
  expect(screen.getByRole('link', { name: 'Link 2' })).toHaveAttribute('href', '/link-2')
})

it('collapses all internal breadcrumbs when more than maxItems', () => {
  renderWithRouter(
    <NavBreadcrumbs
      maxItems={3}
      breadcrumbs={[
        {
          title: 'Link 1',
          href: '/link-1'
        },
        {
          title: 'Link 2',
          href: '/link-2'
        },
        {
          title: 'Link 3',
          href: '/link-3'
        }
      ]}
      currentLinkTitle='Current Link'
    />
  )

  expect(screen.getByRole('link', { name: 'Link 1' })).toBeVisible()
  expect(screen.queryByRole('link', { name: 'Link 2' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Link 3' })).not.toBeInTheDocument()
  expect(screen.getByText('Current Link')).toBeVisible()
})
