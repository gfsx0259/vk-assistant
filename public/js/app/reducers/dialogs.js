import {
    FETCH_DIALOGS_REQUEST,
    FETCH_DIALOGS_RESPONSE,
    FETCH_MESSAGES_REQUEST,
    FETCH_MESSAGES_RESPONSE
} from '../constants/dialog'

const initialState = {
    list: [],
    processing: false,
    messages: [],
    selectedDialogUid: null
};
export default (state = initialState, action) => {

    switch (action.type) {
        case FETCH_DIALOGS_REQUEST:
            console.log('FETCH_DIALOGS_REQUEST reducer');
            return Object.assign({}, state, {processing: true});
        case FETCH_DIALOGS_RESPONSE:
            console.log('FETCH_DIALOGS_RESPONSE reducer');
            return Object.assign({}, state, {list: action.payload, processing: false});
        case FETCH_MESSAGES_REQUEST:
            console.log('FETCH_MESSAGES_REQUEST reducer');
            return Object.assign({}, state, {selectedDialogUid: action.payload, processing: true});
        case FETCH_MESSAGES_RESPONSE:
            console.log('FETCH_MESSAGES_RESPONSE reducer');
            return Object.assign({}, state, {messages: action.payload, processing: false});
        default:
            return state;
    }
}