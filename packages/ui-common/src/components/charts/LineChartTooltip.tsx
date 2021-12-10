/**
 * Functions to generate "sliceTooltop" for Nivo <SingleLineChart>, <Sparkline> and <ProvidersLineChart>.
 * Note that the type signture of the actual method (as output in the console)
 * doesn't match the type signature that the `<ResponsiveLineChart sliceTooltip>` property expects,
 * thus the typecasting shennanegans at the bottom of this file.
 *
 */
import React from 'react'
import { useTheme } from '@material-ui/core'
import { SliceTooltipProps } from '@nivo/line'
import { TickFormatter } from '@nivo/axes'

import { MetricDataSet } from '../../metrics'
import { getTooltipTimeFormatter } from './chartUtils'

/** Actual method signature for Line tooltip input, according to console output. */
interface ActualSliceTooltipMethodProps {
  axis: string
  slice: {
    points: {
      id: string
      index: number
      serieId: string | number
      serieColor: string
      x: number | string | Date
      y: number | string | Date
      color: string
      borderColor: string
      data: {
        color: string
        x: string | number | Date
        y: number
        yStacked: number
        xFormatted: string | number
        yFormatted: string | number
      }
    }[]
  }
}

/** Return value for tooltip according to Nivo typescript setup. */
type IncorrectNivoLineTooltipSignature = React.FunctionComponent<SliceTooltipProps>

/** Tooltip for <SingleLineChart> and <Sparkline> */
function singleLineChartTooltip(
  dataSet: MetricDataSet | undefined,
  formatTime: TickFormatter,
  { slice }: ActualSliceTooltipMethodProps,
  style: Record<string, unknown>
) {
  if (!dataSet) return null
  const { metric } = dataSet
  const firstPoint = slice.points[0]
  const date = firstPoint.data.x as Date
  return (
    <div style={style}>
      <div>{metric.formatWithUnits(firstPoint.data.yFormatted)}</div>
      <div>{formatTime(date)}</div>
    </div>
  )
}
/** Hook to return memoized tooltip calculator for Nivo <SingleLineChart>s and <Sparkline>s.
 * See note about shennageans above. */
export function useSingleLineChartTooltip(dataSet?: MetricDataSet, showTimesAsRanges = false) {
  const theme = useTheme()
  const formatter = getTooltipTimeFormatter(dataSet, showTimesAsRanges)
  return React.useMemo(() => {
    return (((props: ActualSliceTooltipMethodProps) =>
      singleLineChartTooltip(dataSet, formatter, props, {
        background: theme.palette.background.default,
        border: '1px solid #ccc',
        padding: 10
      })) as unknown) as IncorrectNivoLineTooltipSignature
  }, [dataSet, formatter, theme])
}

//
//  <ProvidersLineChart>
//

/** Tooltip for <ProvidersLineChart> */
function providersLineChartTooltip(
  dataSet: MetricDataSet | undefined,
  formatTime: TickFormatter,
  { slice }: ActualSliceTooltipMethodProps
) {
  if (!dataSet) return null
  const { binSize, metric } = dataSet

  const firstPoint = slice.points[0]
  const date = firstPoint.data.x as Date
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #ccc',
        padding: 10,
        minWidth: binSize === 'hour' ? 250 : 180
      }}
    >
      <table cellPadding={3} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th colSpan={3}>
              <b>{formatTime(date)}</b>
            </th>
          </tr>
        </thead>
        <tbody>
          {slice.points.map(point => (
            <tr key={`${point.id}`}>
              <td style={{ verticalAlign: 'middle', width: 20 }}>
                <div
                  style={{
                    position: 'relative',
                    background: point.serieColor,
                    width: 20,
                    height: 20
                  }}
                >
                  &nbsp;
                </div>
              </td>
              <td>{point.serieId}</td>
              <td style={{ whiteSpace: 'nowrap', textAlign: 'right', paddingLeft: 10 }}>
                {metric.formatWithUnits(point.data.yFormatted)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Hook to return memoized tooltip calculator for <ProviderLineChart>.
 * See note about shennageans above. */
export function useProvidersLineChartTooltip(dataSet?: MetricDataSet, showTimesAsRanges = false) {
  const formatter = getTooltipTimeFormatter(dataSet, showTimesAsRanges)
  return React.useMemo(() => {
    return (((props: ActualSliceTooltipMethodProps) =>
      providersLineChartTooltip(dataSet, formatter, props)) as unknown) as IncorrectNivoLineTooltipSignature
  }, [dataSet, formatter])
}
