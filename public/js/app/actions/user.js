import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT_REQUEST,
    LOGOUT_SUCCESS
} from '../constants/user'

import auth from '../services/auth'

import { browserHistory } from 'react-router'

export function login(username, password) {

    return (dispatch) => {
        console.log('dis 1');
        dispatch({
            type: LOGIN_REQUEST,
            payload: {
                username: username,
                password: password
            }
        });

        auth.login(username, password, (loggedIn) => {

            if (loggedIn) {
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: {
                        name: username,
                        authorized: true
                    }
                });
                browserHistory.push('/#/')
            } else {
                dispatch({
                    type: LOGIN_ERROR,
                    payload: {
                        name: '',
                        authorized: false
                    }
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
                    payload: {
                        name: '',
                        authorized: false
                    }
                });
                // TODO redirect to home page
                //router.push('/');
                //dispatch({type:'home', url:'/'});
            }
        });
    }
}