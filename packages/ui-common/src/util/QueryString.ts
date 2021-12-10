import * as qs from 'query-string'

class QueryStringHelper {
  private search: string

  public constructor(search: string) {
    this.search = search
  }

  public get<TQueryStringParams extends { [param: string]: string }>(): TQueryStringParams {
    return qs.parse(this.search) as TQueryStringParams
  }

  public set(params: Record<string, unknown>): string {
    return qs.stringify({ ...qs.parse(this.search), ...params })
  }

  public remove(...keys: string[]): string {
    return qs.stringify(
      keys.reduce((remaining, key) => {
        const { [key]: removed, ...kept } = remaining
        return kept
      }, qs.parse(this.search))
    )
  }
}

export const QueryString: (search?: string) => QueryStringHelper = (search: string = window.location.search) => {
  return new QueryStringHelper(search)
}
