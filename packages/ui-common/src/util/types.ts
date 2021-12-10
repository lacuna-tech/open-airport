/* Turns selected properties of an object as lazy loader functions. Handy when dealing with object literals.
E.g., given type Foo = { a: number, b: string } and type Bar = PartialLazyProps<Foo, 'a'> 
the resulting definition looks like type Bar = { a: () => number; } */

import { except, unique } from './enumerable'

export type PartialLazyProps<T, K extends keyof T> = {
  [P in K]: () => T[P]
}

export type LazyPropsWithParams<T, K extends keyof T, O extends Record<string, unknown>> = {
  [P in K]: (options: O) => T[P]
}

export type LazyProps<T> = {
  [P in keyof T]: () => T[P]
}

export type EnumerablePropsWithParams<T, O extends Record<string, unknown>> = {
  [P in keyof T]: (options: O) => T[P]
}

export type EnumerableProps<T> = {
  [P in keyof T]: T[P][]
}

export type LazyEnumerablePropsWithParams<T, O extends Record<string, unknown>> = {
  [P in keyof T]: (options: O) => T[P][]
}

/* Given two objects of type EnumerableProps<{}>, return an EnumerableProps<{}> with
both object's enumerable values unioned.
E.g., { 
  a: { geography_id: ['b', 'c'] }, 
  b: { geography_id: ['a', 'b'], provider_id: [1, 2] } }
returns: { geography_id: ['a', 'b', 'c'], provider_id: [1, 2] }
*/
export const unionObjectsEnumerables = <T extends EnumerableProps<Record<string, unknown>>>(left: T, right: T) => {
  const keys = unique([...Object.keys(left), ...Object.keys(right)])
  return keys.reduce<T>(
    (accumulation, key) => ({ ...accumulation, [key]: unique([...(left[key] || []), ...(right[key] || [])]) }),
    {} as T
  )
}

/* Given two objects of type EnumerableProps<{}>, return the left EnumerableProps<{}> with
values removed by any matching values in right.
E.g., { 
  left: { geography_id: ['a', 'b'], provider_id: [1, 2] } }
  right: { geography_id: ['b', 'c'] }, 
returns: { geography_id: ['a'], provider_id: [1, 2] }
*/
export const exceptObjectsEnumerables = <T extends EnumerableProps<Record<string, unknown>>>(left: T, right: T) => {
  const keys = unique([...Object.keys(left), ...Object.keys(right)])
  return keys.reduce<T>(
    (accumulation, key) => ({ ...accumulation, [key]: unique(except(left[key] || [], right[key] || [])) }),
    {} as T
  )
}

// Make indexed record from type to allow key based access
export type RecordFrom<T> = {
  [P in keyof T]: T[P]
}
