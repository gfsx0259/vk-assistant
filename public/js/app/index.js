import React from 'react'
import {render} from 'react-dom'
import {Router, hashHistory} from 'react-router'
import { Provider } from 'react-redux'
import auth from './services/auth'
import configureStore from './store/configureStore'

const rootRoute = {
    childRoutes: [{
        path: '/',
        component: require('./components/App'),
        onEnter: function (nextState, replace) {

            let protectedPages = [
                '/messages',
                '/dialogs',
                '/photos',
                '/profiles'
            ];

            if (protectedPages.includes(nextState.location.pathname)) {
                if (!auth.loggedIn()) {
                    replace({
                        pathname: '/login',
                        state: {nextPathname: nextState.location.pathname}
                    })
                }
            }
        },
        childRoutes: [
            require('./routes/Dialogs'),
            require('./routes/Messages'),
            require('./routes/Profile'),
            require('./routes/Login'),
            require('./routes/Registration'),
            require('./routes/Photos')
        ]
    }]
};

const store = configureStore();

render((
    <Provider store={store}>
        <Router
            history={hashHistory}
            routes={rootRoute}
        />
    </Provider>
), document.getElementById('app'));

module.hot.accept();

