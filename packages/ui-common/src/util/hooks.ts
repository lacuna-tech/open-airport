// Partially ported from https://github.com/kotarella1110/use-custom-compare
import { useMemo, DependencyList, useRef, useEffect, EffectCallback, useCallback } from 'react'
import isEqual from 'lodash/isEqual'

export type DepsAreEqual = (prevDeps: DependencyList, nextDeps: DependencyList) => boolean

export function useCompare(deps: DependencyList, depsAreEqual: DepsAreEqual) {
  const ref = useRef<DependencyList>([])
  if (!ref.current || !depsAreEqual(deps, ref.current)) {
    ref.current = deps
  }
  return ref.current
}

export function useDebug(deps: DependencyList) {
  const ref = useRef<DependencyList>([])

  // eslint-disable-next-line no-console
  console.log('useDebug', {
    eql: deps === ref.current,
    deps,
    depsSpread: [...deps],
    refCurrent: ref.current,
    refCurrentSpread: [...ref.current],
    depsCompare: deps.map((d, i) => d === ref.current[i])
  })

  if (!ref.current || deps !== ref.current) {
    ref.current = deps
  }
  return ref.current
}

export function useMemoCompare<T>(factory: () => T, deps: DependencyList, depsAreEqual: DepsAreEqual): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, useCompare(deps, depsAreEqual))
}

export function useMemoDebug<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, useDebug(deps))
}

export function useMemoShallow<T>(factory: () => T, deps: DependencyList): T {
  return useMemoCompare(factory, deps, (prevDeps, nextDeps) => isEqual(prevDeps, nextDeps))
}

export function useEffectCompare(effect: EffectCallback, deps: DependencyList, depsAreEqual: DepsAreEqual) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, useCompare(deps, depsAreEqual))
}

export function useEffectDebug(effect: EffectCallback, deps: DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, useDebug(deps))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallbackCompare<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  depsAreEqual: DepsAreEqual
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, useCompare(deps, depsAreEqual))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallbackShallow<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T {
  return useMemoCompare(callback, deps, (prevDeps, nextDeps) => isEqual(prevDeps, nextDeps))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallbackDebug<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, useDebug(deps))
}

/** Useful when needing to know the previous non-null/undefined value. This is essential
 * in preserving the device details when closing the acitivity panel. As selectedDeviceSession is
 * null when closing, this provides the previous instance of device to display while sliding out.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePreviousInstance<T extends any>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    if (value) ref.current = value
  }, [value])
  return ref.current
}
