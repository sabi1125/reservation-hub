//----------------------------------
// redux reducer ユーザー印証 
//----------------------------------

import { 
  LOGOUT_REQUEST_SUCCESS,
  USER_REQUEST_FAILURE, 
  USER_REQUEST_SUCCESS 
} from "../types/authTypes"

const initialState = {
  loading: true,
  isAuthenticated: null,
  user: {},
  err: null
}

export const authReducer =  (state = initialState, action) => {
  switch (action.type) {
    case USER_REQUEST_SUCCESS:
      return { 
        ...state, 
        loading: false,
        isAuthenticated: true,
        user: action.payload
      }
    case USER_REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        err: action.payload
      }
      case LOGOUT_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: {}
      }
    default:
      return state
  }
}
