import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'

const rootRoute = {
    childRoutes: [ {
        path: '/',
        component: require('./components/App'),
        childRoutes: [
            require('./routes/Dialogs'),
            require('./routes/Messages'),
            require('./routes/Profile'),
            require('./routes/Login'),
            {
                path: 'photos(/:uid)',
                component: require('./routes/Photos'),
            }
        ]
    } ]
}

render((
    <Router
        history={browserHistory}
        routes={rootRoute}
    />
), document.getElementById('app'))


