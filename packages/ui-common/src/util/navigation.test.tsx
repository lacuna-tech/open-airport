import React from 'react'
import '@testing-library/jest-dom'
import { createEvent, fireEvent, render, screen } from '@testing-library/react'

import { MemoryRouter } from 'react-router'
import { useNavigation } from './navigation'

describe('useNavigation', () => {
  const CustomLink: React.FunctionComponent<{ to: string }> = ({ to }) => {
    const { href, onClick } = useNavigation(to)
    return (
      <a href={href} onClick={onClick}>
        Click Me
      </a>
    )
  }

  it('does NOT reload the page on click', () => {
    render(
      <MemoryRouter>
        <CustomLink to='/test/path' />
      </MemoryRouter>
    )

    const linkEl = screen.getByRole('link')
    const event = createEvent.click(linkEl)
    fireEvent(linkEl, event)

    expect(event.defaultPrevented).toEqual(true)
  })

  it('outputs an href attribute', () => {
    render(
      <MemoryRouter>
        <CustomLink to='/test/path' />
      </MemoryRouter>
    )

    const linkEl = screen.getByRole('link')
    expect(linkEl).toHaveAttribute('href', '/test/path')
  })
})
