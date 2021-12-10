/**
 * <PageBoundary> component:
 * - Wraps all "page content" with an error boundary
 *   see: https://reactjs.org/docs/error-boundaries.html
 */
import React from 'react'

import ErrorPage from '../ErrorPage/ErrorPage'

export interface PageBoundaryProps {
  children: React.ReactNode
}

export interface PageBoundaryState {
  error?: Error
}

export default class PageBoundary extends React.Component<PageBoundaryProps, PageBoundaryState> {
  public constructor(props: PageBoundaryProps) {
    super(props)
    this.state = {}
  }

  public static getDerivedStateFromError(error: Error) {
    // eslint-disable-next-line no-console
    console.warn('<PageBoundary> caught error: ', error)
    return { error }
  }

  public render() {
    const { error } = this.state
    if (error) return <ErrorPage error={error} />
    return this.props.children
  }
}
