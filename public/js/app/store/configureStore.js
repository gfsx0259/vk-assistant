import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import createRouterMiddleware from 'redux-action-router';
import thunk from 'redux-thunk'

export default function configureStore(initialState) {

    let routesToActions = {
        '/': 'home'
    };

    let routerMiddleware = createRouterMiddleware(routesToActions);

    const store = createStore(rootReducer, initialState,  applyMiddleware(thunk), applyMiddleware(routerMiddleware));

    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers')
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}