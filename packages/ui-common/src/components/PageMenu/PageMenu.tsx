import React from 'react'
import PageMenuItem, { PageMenuItemProps } from './PageMenuItem'

export interface PageMenuProps {
  pages: PageMenuItemProps[]
}

/**
 * Renders a menu of pages
 */
export default function PageMenu(props: PageMenuProps) {
  const { pages } = props
  return (
    <div>
      {pages.map((p, key) => {
        return <PageMenuItem key={key} {...p} />
      })}
    </div>
  )
}
