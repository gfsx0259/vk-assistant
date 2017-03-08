import {
    SAVE_MAPPING_REQUEST
} from '../constants/profile'

const initialState = {
    mapped: false
};

export default (state = initialState, action) => {
    console.log(state, action);
    // Если пользователь авторизован на сервере, то заполняем данные reducer`a

    switch (action.type) {
        case SAVE_MAPPING_REQUEST:
            console.log('SAVE_MAPPING_REQUEST reducer');
            return Object.assign({}, state, {processing: true});
        default:
            return state;
    }
}