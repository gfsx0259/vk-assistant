import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT_REQUEST,
    LOGOUT_SUCCESS
} from '../constants/user'

import auth from '../services/auth'

export function login(username, password) {

    return (dispatch) => {
        dispatch({
            type: LOGIN_REQUEST,
            payload: {}
        });

        auth.login(username, password, (loggedIn) => {
            if (loggedIn) {
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: username
                });
            } else {
                dispatch({
                    type: LOGIN_ERROR,
                    payload: ''
                });
            }
        });
    };
}

export function logout() {
    return (dispatch) => {
        dispatch({
            type: LOGOUT_REQUEST,
            payload: {}
        });

        auth.logout((loggedOut) => {
            if (loggedOut) {
                dispatch({
                    type: LOGOUT_SUCCESS,
                    payload: ''
                });
            }
        });
    }
}