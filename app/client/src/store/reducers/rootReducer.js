//----------------------------------
// redux 全てのリデューサを定義する
//----------------------------------

import { combineReducers } from 'redux'
import { authReducer } from './authReducer'
import { shopReducer } from './shopReducer'
import { areaReducer } from './areaReducer'
import { prefectureReducer } from './prefectureReducer'
import { cityReducer } from './cityReducer'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
}

const rootReducer = combineReducers({
    auth: authReducer,
    shop: shopReducer,
    area: areaReducer,
    prefecture: prefectureReducer,
    city: cityReducer
  })


  export default persistReducer(persistConfig, rootReducer)