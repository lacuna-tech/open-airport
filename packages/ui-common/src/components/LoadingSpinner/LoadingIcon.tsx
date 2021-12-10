import * as React from 'react'
import { CircularProgress } from '@material-ui/core'

/**
 * Create a loading spinner of the same dimensions of a typical MaterialUI Icon.
 * Effective at swapping out during loading states.
 * E.g.,
      <IconButton>
        {isSearching ? <LoadingIcon /> : <SearchIcon onClick={handleSearchSubmit} />}
      </IconButton>
 * */
export function LoadingIcon() {
  return <CircularProgress color='inherit' size={24} />
}
