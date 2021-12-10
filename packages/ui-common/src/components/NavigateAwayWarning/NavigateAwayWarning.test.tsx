import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useHistory } from 'react-router'
import { History } from 'history'

import { NavigateAwayWarning } from './NavigateAwayWarning'

const TestFixtureImpl = React.forwardRef<{ history: History }, React.PropsWithChildren<Record<string, unknown>>>(
  ({ children }, ref) => {
    const history = useHistory()
    React.useImperativeHandle(
      ref,
      () => ({
        history
      }),
      [history]
    )
    return <>{children}</>
  }
)

const TestFixture = React.forwardRef<{ history: History }, React.PropsWithChildren<Record<string, unknown>>>(
  ({ children }, ref) => (
    <MemoryRouter>
      <TestFixtureImpl ref={ref}>{children}</TestFixtureImpl>
    </MemoryRouter>
  )
)

it('shows a dialog when attempting to navigate away', () => {
  const ref = React.createRef<{ history: History }>()
  render(
    <TestFixture ref={ref}>
      <NavigateAwayWarning />
    </TestFixture>
  )

  act(() => {
    ref.current!.history.push('/somewhere-else')
  })

  const dialog = screen.getByRole('dialog')
  expect(dialog).toBeVisible()
})

it('blocks navigation', () => {
  const ref = React.createRef<{ history: History }>()
  render(
    <TestFixture ref={ref}>
      <NavigateAwayWarning />
    </TestFixture>
  )

  act(() => {
    ref.current!.history.push('/somewhere-else')
  })

  expect(ref.current!.history.location.pathname).not.toEqual('/somewhere-else')
})

it("doesn't navigate after canceling", () => {
  const ref = React.createRef<{ history: History }>()
  render(
    <TestFixture ref={ref}>
      <NavigateAwayWarning />
    </TestFixture>
  )

  act(() => {
    ref.current!.history.push('/somewhere-else')
  })
  userEvent.click(screen.getByRole('button', { name: /cancel/i }))

  expect(ref.current!.history.location.pathname).not.toEqual('/somewhere-else')
})

it('completes navigation after user confirms', () => {
  const ref = React.createRef<{ history: History }>()
  render(
    <TestFixture ref={ref}>
      <NavigateAwayWarning />
    </TestFixture>
  )

  act(() => {
    ref.current!.history.push('/somewhere-else')
  })
  userEvent.click(screen.getByRole('button', { name: /continue/i }))

  expect(ref.current!.history.location.pathname).toEqual('/somewhere-else')
})

describe('when disabled', () => {
  it("doesn't block navigation", () => {
    const ref = React.createRef<{ history: History }>()
    render(
      <TestFixture ref={ref}>
        <NavigateAwayWarning disable />
      </TestFixture>
    )

    act(() => {
      ref.current!.history.push('/somewhere-else')
    })

    expect(ref.current!.history.location.pathname).toEqual('/somewhere-else')
  })

  it("doesn't show a dialog on navigation", () => {
    const ref = React.createRef<{ history: History }>()
    render(
      <TestFixture ref={ref}>
        <NavigateAwayWarning disable />
      </TestFixture>
    )

    act(() => {
      ref.current!.history.push('/somewhere-else')
    })

    const dialog = screen.queryByRole('dialog')
    expect(dialog).not.toBeInTheDocument()
  })
})
