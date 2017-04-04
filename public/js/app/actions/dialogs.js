import {
    FETCH_DIALOGS_REQUEST,
    FETCH_DIALOGS_RESPONSE,
    FETCH_MESSAGES_REQUEST,
    FETCH_MESSAGES_RESPONSE
} from '../constants/dialog'

import dialogsService from '../services/dialogs'

export function fetch() {

    return (dispatch) => {
        dispatch({
            type: FETCH_DIALOGS_REQUEST,
            payload: []
        });

        dialogsService.fetch((result) => {
            // Вызываем обновление данных reducer
            dispatch({
                type: FETCH_DIALOGS_RESPONSE,
                payload: result.items
            });
            // Просим сервер ждать обновлений
        });
    };
}

export function fetchMessages(uid) {

    return (dispatch) => {
        dispatch({
            type: FETCH_MESSAGES_REQUEST,
            payload: uid
        });

        dialogsService.fetchMessages(uid, (result) => {
            // Вызываем обновление данных reducer
            dispatch({
                type: FETCH_MESSAGES_RESPONSE,
                payload: result.items
            });
            // Просим сервер ждать обновлений
        });
    };
}