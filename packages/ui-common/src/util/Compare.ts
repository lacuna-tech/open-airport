export type ICompareFunction<T> = (a: T, b: T) => number

export const Equals = {
  NullOrUndefined: <T>(value: T): boolean => {
    return value === undefined || value === null
  },
  NullOrEmpty: (value: string): boolean => {
    return Equals.NullOrUndefined(value) || value === ''
  },
  Sequence: <T>(left: T[], right: T[]): boolean => {
    return left && right && left.length === right.length && left.every((element, index) => element === right[index])
  }
}

const SafeCompare = <T>(compare: ICompareFunction<T>, { descending }: { descending: boolean }): ICompareFunction<T> => {
  const direction = descending ? -1 : 1
  return (a, b) => {
    if (Equals.NullOrUndefined(a) && Equals.NullOrUndefined(b)) {
      return 0
    }
    if (Equals.NullOrUndefined(a)) {
      return 1 * direction
    }
    if (Equals.NullOrUndefined(b)) {
      return -1 * direction
    }
    return compare(a, b) * direction
  }
}

const CompareMethods = (options: { descending: boolean }) => ({
  Sensitive: SafeCompare<string>((a, b) => a.trim().localeCompare(b.trim()), options),
  Insensitive: SafeCompare<string>(
    (a, b) => a.trim().toLocaleLowerCase().localeCompare(b.trim().toLocaleLowerCase()),
    options
  ),
  Numeric: SafeCompare<number>((a, b) => a - b, options),
  Using: <T>(compare: ICompareFunction<T>) => SafeCompare<T>(compare, options)
})

export const Compare = {
  ...CompareMethods({ descending: false }),
  Descending: {
    ...CompareMethods({ descending: true })
  }
}
