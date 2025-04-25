import { Range } from '../../model/Range'

export interface GridDefinition {
  gridIntervalCount: number
  gridIntervalPixels: number
  gridIntervalSize: number
  gridValueRange: Range
}

export function getGridDefinition(
  valueRange: Range,
  totalPixels: number,
  preferredIntervalPixels: number,
  multipliers: number[]
): GridDefinition {
  const intervalSize = getGridIntervalSize(valueRange, totalPixels, preferredIntervalPixels, multipliers)
  let intervalCount = Math.ceil(valueRange.size / intervalSize)
  let gridMinValue = valueRange.start
  if (gridMinValue !== 0) {
    gridMinValue = gridMinValue - (gridMinValue % intervalSize)
    if (gridMinValue >= valueRange.start) {
      intervalCount++
      gridMinValue = gridMinValue - intervalSize
    }
  }
  let gridMaxValue = gridMinValue + intervalCount * intervalSize
  if (valueRange.end >= gridMaxValue) {
    intervalCount++
    gridMaxValue = gridMaxValue + intervalSize
  }
  return {
    gridIntervalCount: intervalCount,
    gridIntervalPixels: Math.round(totalPixels / intervalCount),
    gridIntervalSize: intervalSize,
    gridValueRange: new Range(gridMinValue, gridMaxValue),
  }
}

function getGridIntervalSize(
  valueRange: Range,
  totalGridPixels: number,
  preferredIntervalPixels: number,
  multipliers: number[]
): number {
  const preferredIntervalSize = Math.round(valueRange.size / (totalGridPixels / preferredIntervalPixels))
  const intervalRangeMagnitude = 10 ** (String(preferredIntervalSize).length - 1)
  return multipliers
    .map((multiplier) => intervalRangeMagnitude * multiplier)
    .reduce((previosIntervalSize, currentIntervalSize) =>
      Math.abs(previosIntervalSize - preferredIntervalSize) < Math.abs(currentIntervalSize - preferredIntervalSize)
        ? previosIntervalSize
        : currentIntervalSize
    )
}
