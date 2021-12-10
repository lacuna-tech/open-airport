import { last, firstOrDefault, defined } from './enumerable'

export const definedValues = <TKey extends string, TValue>(obj: { [key in TKey]: TValue | undefined | null }) => {
  return defined(Object.values<TValue | undefined | null>(obj))
}

/**
 * Stripping out the undefined or null property values of an object literal. This is a handy way removing the
 * Partial aspect of Partial<{ [key]: value}> from typed variables.
 * */
export const whole = <TKey extends string, TValue>(obj: { [key in TKey]: TValue | undefined | null }) => {
  return LiteralEntries<TKey, TValue | undefined | null>(obj).reduce<Partial<{ [key in TKey]: TValue }>>(
    (accumulation, [key, value]) => (value ? { ...accumulation, [key]: value } : accumulation),
    {}
  ) as { [key in TKey]: TValue }
}

export const firstOrDefaultEntry = <TKey extends string, TValue>(obj: { [key in TKey]: TValue }) => {
  return firstOrDefault(Object.values<TValue>(obj))
}

/* An Object.key wrapper that assists with the key typing.
  This allows the key to be typed as the indicated string literal instead of plain sting. */
export const LiteralKeys = <TKey extends string>(obj: { [key: string]: unknown }) => {
  return Object.keys(obj) as TKey[]
}

/* Given an object literal, pick a random property key as a typed string literal instead of plain string. */
export const RandomLiteralKey = <TKey extends string>(obj: { [key: string]: unknown }) => {
  const keys = LiteralKeys<TKey>(obj)
  return keys[Math.floor(Math.random() * keys.length)]
}

/* An Object.entries wrapper that assists with the key typing.
  This allows the key to be typed as the indicated string literal instead of plain sting. */
export const LiteralEntries = <TKey extends string, TValue>(obj: { [key in TKey]: TValue }) => {
  return Object.entries(obj) as [TKey, TValue][]
}

export const LiteralPartialEntries = <TKey extends string, TValue>(obj: Partial<{ [key in TKey]: TValue }>) => {
  return Object.entries(obj) as [TKey, TValue][]
}

/*
 * Filter the property value pairs of an object literal by predicate. Saves the overhead of destructuring,
 * fitering, and restructing a map.
 */
export const LiteralFilter = <TKey extends string, TValue>(
  object: { [key in TKey]: TValue },
  predicate: (value: TValue) => boolean
) => {
  return [...new Map(LiteralEntries<TKey, TValue>(object).filter(([, value]) => predicate(value))).entries()].reduce<
    Partial<{ [key in TKey]: TValue }>
  >((accumulation, [key, value]) => ({ ...accumulation, [key]: value }), {}) as {
    [key in TKey]: TValue
  }
}

/**
 * Transform an object literal of { [key in TKey]: TInValue } to a new object literal of { [key in TKey]: TOutValue } using
 * using a predicate function to map TInValue to TOutValue.
 * TOutValue can be filtered out of the object by returning null in the predicate.
 * */
export const LiteralMap = <TKey extends string, TInValue, TOutValue>(
  object: { [key in TKey]: TInValue },
  predicate: (value: TInValue) => TOutValue | null
) => {
  return LiteralEntries<TKey, TInValue>(object).reduce<Partial<{ [key in TKey]: TOutValue }>>(
    (accumulation, [key, value]) => {
      const predicateValue = predicate(value)
      return predicateValue ? { ...accumulation, [key]: predicate(value) } : accumulation
    },
    {}
  ) as { [key in TKey]: TOutValue }
}

/* Group an array of TValue objects keyed by the TKey value of the property indicated by the predicate.
E.g.,
Given
  values: [ { id: 1, foo: 'a' }, { id: 2, foo: 'b' }, { id: 3, foo: 'a' } ]
  predicate: obj => obj.foo
Returns
  { 'a': [ { id: 1, foo: 'a' }, { id: 3, foo: 'a' } ], 'b': [ { id: 2, foo: 'b' } ] }
  */
export const groupBy = <TKey extends string, TValue>(values: TValue[], predicate: (value: TValue) => TKey) => {
  return values.reduce<Partial<{ [key in TKey]: TValue[] }>>((map, value) => {
    const key = predicate(value)
    return { ...map, [key]: key in map ? [...map[key]!, value] : [value] }
  }, {}) as { [key in TKey]: TValue[] }
}

/* Key the last value of an array of TValue objects by the TKey value of the property indicated by the predicate.
E.g.,
Given
  values: [ { id: 1, foo: 'a' }, { id: 2, foo: 'b' }, { id: 3, foo: 'a' } ]
  predicate: obj => obj.foo
Returns
  { 'a': { id: 3, foo: 'a' }, 'b': { id: 2, foo: 'b' } }
  */
export const keyBy = <TKey extends string, TValue>(values: TValue[], predicate: (value: TValue) => TKey) => {
  return LiteralEntries<TKey, TValue[]>(groupBy<TKey, TValue>(values, predicate)).reduce<
    Partial<{ [key in TKey]: TValue }>
  >((accumulation, [key, value]) => ({ ...accumulation, [key]: last(value) }), {}) as { [key in TKey]: TValue }
}
