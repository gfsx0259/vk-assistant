import {
    FETCH_DIALOGS_REQUEST,
    FETCH_DIALOGS_RESPONSE,
} from '../constants/dialog'

const initialState = {
    list: [],
    processing: false
};
export default (state = initialState, action) => {

    switch (action.type) {
        case FETCH_DIALOGS_REQUEST:
            console.log('FETCH_DIALOGS_REQUEST reducer');
            return Object.assign({}, state, {processing: true});
        case FETCH_DIALOGS_RESPONSE:
            console.log('FETCH_DIALOGS_RESPONSE reducer');
            return Object.assign({}, state, {list: action.payload, processing: false});
        default:
            return state;
    }

    return state;
}