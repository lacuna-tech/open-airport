/* eslint-disable no-console */
/**
 * App- and agency-specific storage for "local" preferences which survive page reload.
 * Used by `store_utils` to save redux data so app restart is as seamless as possible.
 *
 * Create one for your app (using app-config to get `APP_KEY`)
 * and pass it to `createReduxStore()`, etc.
 *
 * Values are converted to/from JSON when saving/reloading.
 *
 */
export default class AppStorage {
  private APP_KEY: string

  public constructor(APP_KEY: string) {
    this.APP_KEY = `${APP_KEY}-`
  }

  /**
   * Store `value` for `key`.
   * `value` will be JSON stringified automatically.
   */
  public store<T>(key: string, value: T) {
    if (value === undefined) return this.remove(key)
    try {
      const encoded = JSON.stringify(value)
      window.localStorage.setItem(this.APP_KEY + key, encoded)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`device.storeValue(${key}): error stringifying value:`, value, `error:`, e)
    }
    return value
  }

  /**
   * Get stored value for `key`
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(key: string): any {
    const value: string | null = window.localStorage.getItem(this.APP_KEY + key)
    if (value != null) {
      try {
        return JSON.parse(value)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`appStorage.get('${key}'): can't parse value `, value)
        return undefined
      }
    }
    return value
  }

  /**
   * Clear locally stored value for `key`.
   */
  public remove(key: string): void {
    window.localStorage.removeItem(this.APP_KEY + key)
  }

  /**
   * Get and remove stored value for `key`
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getAndRemove(key: string): any {
    const value = this.get(key)
    this.remove(key)
    return value
  }

  /**
   * Clear all associated localStorage values.
   */
  public clearAll() {
    Object.keys(window.localStorage).forEach(key => {
      if (key.startsWith(this.APP_KEY)) window.localStorage.removeItem(key)
    })
  }
}
