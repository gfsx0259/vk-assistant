import {
    FETCH_DIALOGS_REQUEST,
    FETCH_DIALOGS_RESPONSE
} from '../constants/dialog'

import dialogsService from '../services/dialogs'

export function fetch() {

    return (dispatch) => {
        dispatch({
            type: FETCH_DIALOGS_REQUEST,
            payload: []
        });

        dialogsService.fetch((result) => {
            dispatch({
                type: FETCH_DIALOGS_RESPONSE,
                payload: result.items
            });
             dialogsService.fetchLongPull(result => {
                 console.log(result);
             });
        });
    };
}