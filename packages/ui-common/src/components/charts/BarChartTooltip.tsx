/**
 * Function to generate "sliceTooltop" for Nivo <ProvidersBarChart>.
 */
import React from 'react'
import { DateTime } from 'luxon'
import { BarExtendedDatum } from '@nivo/bar'

import { MetricDataSet } from '../../metrics'

function providersBarChartTooltip(dataSet: MetricDataSet | undefined, { data }: BarExtendedDatum) {
  if (!dataSet) return null
  const { binSize, metric } = dataSet
  const { time, ...providerMap } = data
  // NOTE: `time` comes in as `2/19`:  convert to a Date.
  // ASSUMES that we're dealing with this year and in browser/server timezones match.
  //         :-(
  const date = new Date(time)
  const providers = Object.keys(providerMap).map(provider => {
    const value = providerMap[provider] as number
    return { provider, value }
  })
  return (
    <div
      style={{
        minWidth: binSize === 'hour' ? 250 : 180
      }}
    >
      <table cellPadding={3} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th colSpan={2}>
              <b>{DateTime.fromJSDate(date).toFormat(binSize === 'hour' ? "ccc, D 'at' t" : 'ccc, D')}</b>
            </th>
          </tr>
        </thead>
        <tbody>
          {providers.map(({ provider, value }) => (
            <tr key={`${provider}`}>
              {/* }
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
              */}
              <td>{provider}</td>
              <td style={{ whiteSpace: 'nowrap', textAlign: 'right', paddingLeft: 10 }}>
                {metric.formatWithUnits(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Expose as a memoized hook and convert to match Nivo's `sliceTooltip` prop expectations
 * (which don't match actual value passed in). */
export function useProvidersBarChartTooltip(dataSet?: MetricDataSet) {
  return React.useMemo(() => {
    return (props: BarExtendedDatum) => providersBarChartTooltip(dataSet, props)
  }, [dataSet])
}
