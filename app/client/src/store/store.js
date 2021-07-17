//----------------------------------
// redux create sotre modules
//----------------------------------

import { createStore, applyMiddleware, compose } from 'redux'
import persistReducer from './reducers/rootReducer'
import thunk from 'redux-thunk'
import logger from 'redux-logger'


const middleware = [thunk, logger]

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  persistReducer, composeEnhancer(applyMiddleware(...middleware))
)

export default store