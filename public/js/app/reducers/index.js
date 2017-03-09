import {combineReducers} from 'redux'
import dialogs from './dialogs'
import user from './user'
import profile from './profile'

export default combineReducers({
    dialogs,
    user,
    profile
})