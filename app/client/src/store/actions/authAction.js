//----------------------------------
// redux action ユーザー印証管理関数
//----------------------------------

import apiEndpoint from '../../utils/api/axios'
import setAuthToken from '../../utils/setAuthToken'
import { 
  USER_REQUEST_START, 
  USER_REQUEST_SUCCESS, 
  USER_REQUEST_FAILURE,
  LOGOUT_REQUEST_FAILURE,
  LOGOUT_REQUEST_SUCCESS,
} from '../types/authTypes'

export const userRequestStart = () => {
  return { 
    type: USER_REQUEST_START 
  }
}

export const userRequestFailure = (err) => {
  return {
    type: USER_REQUEST_FAILURE,
    payload: err.response.data
  }
}

export const logoutRequestFailure = (err) => {
  return {
    type: LOGOUT_REQUEST_FAILURE,
    payload: err.response.data
  }
}

export const loginStart = (email, password) => async dispatch => {

  try {
    
    const { data: { user, token } } = await apiEndpoint.localLogin(email, password)
    
    setAuthToken(token)

    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: user
    })
  } catch (e) {
    dispatch(userRequestFailure(e))
  }

}

export const googleLogin = (googleResponse) => async (dispatch) => {

  dispatch(userRequestStart())
  try {
    const user = await apiEndpoint.googleLogin(googleResponse.tokenId)
    const token = user.data.token

    setAuthToken(token)

    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: user.data.user
    })
  } catch (e) {
    dispatch(userRequestFailure(e))
    console.log(e)
  }
}

export const logout = () => async dispatch => {
  try {
    const message = await apiEndpoint.logout()

    dispatch({
      type: LOGOUT_REQUEST_SUCCESS,
      payload: message
    })

  } catch (e) {
    dispatch(userRequestFailure(e))
  }

}