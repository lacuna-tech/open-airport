/**
 * Make array of elements unique by some given predicate function.
 *
 * @param values Array of values to make unique.
 * @param predicate Function to use as key to indicate uniqueness.
 * @returns Array of values unique by predicate function.
 */
export const uniqueBy = <T>(values: T[], predicate: (t: T) => string | number) => {
  const keyValuePairs = new Map(values.map(v => [predicate(v), v]))
  return [...keyValuePairs.values()]
}

export const unique = <T>(values: T[]) => Array.from(new Set(values))

/* Running a filter on an array and returning an expected single result if length === 1 or default if length === 0.
   An error is logged if results.length ==0 or >1 */
export const singleOrDefaultWhere = <T>(values: T[], predicate: (t: T) => boolean, defaultValue?: T) => {
  const results = values.filter(predicate)
  if (results.length > 1) {
    // eslint-disable-next-line no-console
    console.error('Predicate of singleOrDefaultWhere yielded results.length > 1.', { values, results })
  }
  return results.length === 1 ? results[0] : defaultValue
}

export const singleOrDefault = <T>(values: T[], defaultValue?: T) => {
  return singleOrDefaultWhere(values, () => true, defaultValue)
}

/* Running a filter on an array and returning an expected single result.
   An error is logged if results.length ==0 or >1 */
export const singleWhere = <T>(values: T[], predicate: (t: T) => boolean) => {
  const result = singleOrDefaultWhere(values, predicate, undefined)
  if (result === undefined) {
    // eslint-disable-next-line no-console
    console.error(
      'Predicate of single yielded a default value which could mean results.length > 1 || results.length === 0.',
      { values, result }
    )
  }
  return result!
}

export const single = <T>(values: T[]) => {
  return singleWhere(values, () => true)
}

export const firstOrDefaultWhere = <T>(values: T[], predicate: (t: T) => boolean, defaultValue?: T) => {
  for (const value of values) {
    if (predicate(value)) {
      return value
    }
  }
  return defaultValue || values[0]
}

export const first = <T>(values: T[]) => {
  return values[0]
}

export const firstOrDefault = <T>(values: T[], defaultValue?: T) => {
  return values.length > 0 ? values[0] : defaultValue
}

export const lastOrDefaultWhere = <T>(values: T[], predicate: (t: T) => boolean, defaultValue?: T) => {
  return firstOrDefaultWhere(values.reverse(), predicate, defaultValue)
}

export const lastOrDefault = <T>(values: T[], defaultValue?: T) => {
  return values.length > 0 ? values[values.length - 1] : defaultValue
}

export const last = <T>(values: T[]) => {
  return values[values.length - 1]
}

export const take = <T>(values: T[], amount: number) => {
  return values.slice(0, amount)
}

export const takeRandom = <T>(values: T[], min = 0) => {
  const takeAmount = min + Math.floor((values.length + 1 - min) * Math.random())
  return take(values, takeAmount)
}

export const getRandom = <T>(values: T[]) => {
  return values[Math.floor(values.length * Math.random())]
}

export const intersect = <T>(left: T[], right: T[]) => {
  return left.filter(value => right.includes(value))
}

export const except = <T>(left: T[], right: T[]) => {
  return left.filter(value => !right.includes(value))
}

export const exceptOne = <T>(items: T[], item: T) => {
  return items.filter(value => value !== item)
}

export const defined = <T>(values: (T | undefined | null)[] | undefined | null) => {
  return values ? values.filter((value): value is T => value !== null && value !== undefined) : []
}

export const selectMany = <P, C>(values: P[], predicate: (t: P) => C[]) => {
  return values.reduce<C[]>((accumulation, value) => [...accumulation, ...predicate(value)], [])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LiteralArray = <TValue extends string>(values: any) => {
  return values as TValue[]
}
