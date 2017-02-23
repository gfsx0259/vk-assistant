import React from 'react'
import { render } from 'react-dom'
import { Router, hashHistory } from 'react-router'

const rootRoute = {
    childRoutes: [ {
        path: '/',
        component: require('./components/App'),
        childRoutes: [
            require('./routes/Dialogs'),
            require('./routes/Messages'),
            require('./routes/Profile'),
            require('./routes/Login'),
            require('./routes/Photos')
        ]
    } ]
}

render((
    <Router
        history={hashHistory}
        routes={rootRoute}
    />
), document.getElementById('app'))


