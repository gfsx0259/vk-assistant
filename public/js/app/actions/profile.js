import {
    SAVE_MAPPING_REQUEST,
    SAVE_MAPPING_RESPONSE
} from '../constants/profile'

import profileService from '../services/profile'

export function saveMapping(params) {
    console.log(params);

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