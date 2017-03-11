import {
    SAVE_MAPPING_REQUEST,
    SAVE_MAPPING_RESPONSE,
    FETCH_CONTACT_REQUEST,
    FETCH_CONTACT_RESPONSE
} from '../constants/profile'

const initialState = {
    contact: {},
    processing: false
};

export default (state = initialState, action) => {
    console.log(state, action);
    // Если пользователь авторизован на сервере, то заполняем данные reducer`a

    switch (action.type) {
        case SAVE_MAPPING_REQUEST:
            console.log('SAVE_MAPPING_REQUEST reducer');
            return Object.assign({}, state, {processing: true});
        case SAVE_MAPPING_RESPONSE:
            console.log('SAVE_MAPPING_RESPONSE reducer');
            return Object.assign({}, state, {processing: false, contact: action.payload});
        case FETCH_CONTACT_REQUEST:
            console.log('FETCH_CONTACT_REQUEST reducer');
            return Object.assign({}, state, {processing: true});
        case FETCH_CONTACT_RESPONSE:
            console.log('FETCH_CONTACT_RESPONSE reducer');
            return Object.assign({}, state, {processing: false, contact: action.payload});
        default:
            return state;
    }
}