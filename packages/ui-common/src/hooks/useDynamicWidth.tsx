import { useMediaQuery } from '@material-ui/core'

export type DynamicMaxWidth = number | [LowerMaxWidth: number, UpperMaxWidth: number]

/**
 * Returns a maxWidth based on provided arg
 *
 * If arg is tuple, return maxWidth based on media query screen size
 * else just return the provided value
 *
 * @param maxWidth - number | [UpperMaxWidth, LowerMaxWidth]
 */
export const useDynamicWidth = ({ maxWidth }: { maxWidth?: DynamicMaxWidth }) => {
  const isLargeScreen = useMediaQuery('(min-width:1919px') // change maxWidth for breadcrumbs based on current screen res
  if (!maxWidth) return undefined
  if (typeof maxWidth === 'number') {
    return maxWidth
  }
  return isLargeScreen ? maxWidth[1] : maxWidth[0]
}
