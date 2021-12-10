// Rounds a percent value up to next 25% increment. E.g., 0.1 -> 0.25 or 0.67 => 0.75
export const binPercentByQuarter = (value: number) => {
  return clampPercent(Math.floor(value / 0.25) * 0.25)
}

// 50% chance to change. If change, 50% chance to go down or up, while clamped between 0.25-1.0
export const randomSmoothQuarterChange = (value: number) => {
  if (Math.round(Math.random()) === 1) {
    // No change
    return value
  }

  const binValue = binPercentByQuarter(value)

  if (binValue === 0) {
    return value + 0.25
  }
  if (binValue >= 0.75) {
    return value - 0.25
  }

  return value + (Math.round(Math.random()) === 1 ? 0.25 : -0.25)
}

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))
export const clampPercent = (value: number) => clamp(value, 0, 1)
