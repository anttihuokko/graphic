export type ChartSettings = {
  gapsRemoved: boolean
  gapsVisualized: boolean
  debugInfoVisible: boolean
}

export const DEFAULT_CHART_SETTINGS: ChartSettings = {
  gapsRemoved: true,
  gapsVisualized: false,
  debugInfoVisible: false,
}
