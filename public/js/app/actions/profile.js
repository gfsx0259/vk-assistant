import {
    SAVE_MAPPING_REQUEST
} from '../constants/profile'

import profileService from '../services/profile'

export function saveMapping(username, password) {
    console.log(username, password);

    profileService.saveMapping();

    return (dispatch) => {
        dispatch({
            type: SAVE_MAPPING_REQUEST,
            payload: []
        });
    };
}