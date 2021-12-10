import { ConfigReducerState } from '.'

type AppState = ConfigReducerState

export const selectConfigLoadState = (state: AppState) => {
  return state.organizationConfigState.loaded
}
