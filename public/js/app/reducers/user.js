import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT_REQUEST,
    LOGOUT_SUCCESS
} from '../constants/user'

const initialState = {
    name: '',
    authorized: false,
    processing: false,
    redirect: null
};

export default (state = initialState, action) => {
    console.log(state, action);
    // Если пользователь авторизован на сервере, то заполняем данные reducer`a
    if (user) {
        state.name = user.name;
        state.authorized = user.authorized;
    }

    switch (action.type) {
        case LOGIN_REQUEST:
            console.log('LOGIN_REQUEST reducer');
            return Object.assign({}, state, {processing: true});
        case LOGIN_SUCCESS:
            console.log('LOGIN_SUCCESS reducer');
            return Object.assign({}, state, {name: action.payload, authorized: true, processing: false, redirect: '/'});
        case LOGIN_ERROR:
            console.log('LOGIN_ERROR reducer');
            return Object.assign({}, state, {name: action.payload, authorized: false, processing: false});
        case LOGOUT_REQUEST:
            console.log('LOGOUT_REQUEST reducer');
            return Object.assign({}, state, {processing: true});
        case LOGOUT_SUCCESS:
            console.log('LOGOUT_SUCCESS reducer');
            return Object.assign({}, state,  {user: action.payload, authorized: false, processing: false});
        default:
            return state;
    }

    return state
}