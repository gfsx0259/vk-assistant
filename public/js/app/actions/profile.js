import {
    SAVE_MAPPING_REQUEST,
    SAVE_MAPPING_RESPONSE,
    FETCH_CONTACT_REQUEST,
    FETCH_CONTACT_RESPONSE
} from '../constants/profile'

import profileService from '../services/profile'

export function fetchContact() {
    return (dispatch) => {
        dispatch({
            type: FETCH_CONTACT_REQUEST,
            payload: {}
        });

        profileService.fetchContact((contact) => {
                dispatch({
                    type: FETCH_CONTACT_RESPONSE,
                    payload: contact
                });
        });
    }
}

export function saveMapping(params) {
    return (dispatch) => {
        dispatch({
            type: SAVE_MAPPING_REQUEST,
            payload: []
        });

        profileService.saveMapping(params, (err, contact) => {

            dispatch({
                type: SAVE_MAPPING_RESPONSE,
                payload: contact
            });

            if (err) {
                alert('Данные некорректны');
            } else {
                console.log('Сохранено');
            }
        });

    };
}