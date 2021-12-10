/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import React from 'react'

import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'

import { LoadingSpinner } from '..'
import { Metric, MetricSet, MetricValue } from '../../metrics'
import { LoadState } from '../../util/store_utils'

/** Column headers ABOVE normal metric headers */
export interface MetricsTableHeader {
  title: string
  colSpan?: number
}

/** Metrics we'll show in the table */
export interface MetricsTableColumn {
  metric: Metric
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  showSLA?: boolean
  round?: boolean
  units?: string
}

export interface MetricsTableProps {
  /* Array of MetricSets to show -- one per row. */
  rows?: MetricSet[]
  /* LoadState of above metrics. */
  loadState: LoadState
  /* Columns of metrics to show. */
  columns: MetricsTableColumn[]
  /* Separate row of headers above metric columns */
  headers?: MetricsTableHeader[]
}
export default function MetricsTable({ rows, loadState, columns, headers }: MetricsTableProps) {
  // Forget it if we didn't get any metrics
  if (!rows || loadState === LoadState.unloaded || loadState === LoadState.loading) {
    return (
      <Grid container spacing={2} style={{ width: '100%' }}>
        <LoadingSpinner />
      </Grid>
    )
  }
  const colWidth = `${Math.floor(100 / columns.length)}%`
  return (
    <Grid container spacing={2}>
      <table style={{ width: '100%', margin: `0 10px` }}>
        <thead>
          {headers && (
            <tr>
              {headers.map((header, index) => (
                <th key={index} colSpan={header.colSpan || 1}>
                  {header.title && (
                    <fieldset style={{ borderWidth: '1px 0px 0 0px', height: '1em' }}>
                      <legend style={{ paddingInlineStart: 10, paddingInlineEnd: 10 }}>{header.title}</legend>
                    </fieldset>
                  )}
                  {!header.title && ' '}
                </th>
              ))}
            </tr>
          )}
          <tr>
            {columns.map(({ metric, title = metric.title, description = metric.description }) => (
              <th
                key={metric.name}
                style={{ width: colWidth, textAlign: 'left', verticalAlign: 'bottom', cursor: 'pointer' }}
              >
                <Tooltip title={description || 'TODO: HELPTEXT'}>
                  <span>{title || 'TODO TITLE'}</span>
                </Tooltip>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <MetricsTableRow key={index} metrics={row} columns={columns} />
          ))}
        </tbody>
      </table>
    </Grid>
  )
}

export function MetricsTableRow({ metrics, columns }: { metrics: MetricSet; columns: MetricsTableColumn[] }) {
  const { provider_id } = metrics

  return (
    <tr key={provider_id} className={'visible'}>
      {columns.map(({ metric, showSLA, round, units = '' }) => {
        const data = metrics.getMetricData(metric)
        let value: MetricValue = '???'
        let color = 'black'
        let sla = ''
        if (data && data.value != null) {
          if (round && typeof data.value === 'number') value = Math.round(data.value)
          else value = metric.format(data.value)
          if (metric.hasSLA && typeof data.slaValue === 'number' && typeof data.violation === 'boolean') {
            color = data.violation ? 'darkred' : 'darkgreen'
            if (showSLA) sla = `(${metric.format(data.slaValue)})`
          }
        }
        return (
          <td key={metric.name}>
            <span style={{ color }}>
              {value} {units}
            </span>{' '}
            <span style={{ opacity: 0.5 }}>{sla}</span>
          </td>
        )
      })}
    </tr>
  )
}
