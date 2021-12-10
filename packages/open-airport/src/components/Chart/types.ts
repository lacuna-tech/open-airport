import { LegendProps } from '@nivo/legends'

export interface Dimensions {
  width: number
  height: number
}
export interface ChartLegendOptions {
  legend: LegendProps[]
  margin:
    | Partial<{
        bottom: number
        left: number
        right: number
        top: number
      }>
    | undefined
}
