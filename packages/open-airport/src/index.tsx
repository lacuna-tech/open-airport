import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import { QueryParamProvider } from 'use-query-params'
import { Route } from 'react-router-dom'
import App from './App'
import store, { history } from './store'

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <QueryParamProvider ReactRouterRoute={Route}>
        <App />
      </QueryParamProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
