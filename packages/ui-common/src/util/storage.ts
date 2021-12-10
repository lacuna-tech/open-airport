// DEPRECATED: consider using `AppStorage.ts` instead

// ------------------------------------
// App-specific localStorage shim.
// Values are converted to/from JSON when saving/reloading.
// Keys are also prefixed with `APP_KEY` so they're unique to this app.
// ------------------------------------

// ------------------------------------
// LocalStorage shims
// Values are automatically JSON encoded and prefixed with `APP_KEY`.
// ------------------------------------
const APP_KEY = 'policy-'

// Clear locally stored value for `key`.
export function removeStoredValue(key: string): void {
  window.localStorage.removeItem(APP_KEY + key)
}

// Store `value` locally under `key`.
// `value` will automatically be JSON encoded.
export function storeValue<T>(key: string, value: T) {
  if (value === undefined) return removeStoredValue(key)
  try {
    const encoded = JSON.stringify(value)
    window.localStorage.setItem(APP_KEY + key, encoded)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`device.storeValue(${key}): error stringifying value`, e, value)
  }
  return value
}

// Retrieved locally stored `value`.
// `value` will automatically be JSON decoded.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStoredValue(key: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any = window.localStorage.getItem(APP_KEY + key)
  if (value !== undefined) return JSON.parse(value)
  return value
}
