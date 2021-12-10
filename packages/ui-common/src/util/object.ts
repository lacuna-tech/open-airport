export const isSubset = <T extends Record<string, unknown>>(superset: Partial<T>, subset: Partial<T>) => {
  return Object.keys(subset).every(key => superset[key] && superset[key] === subset[key])
}
