import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import './stubs/COURSES'


const rootRoute = {
    childRoutes: [ {
        path: '/',
        component: require('./components/App'),
        childRoutes: [
            require('./routes/Dialogs'),
            require('./routes/Messages'),
            require('./routes/Profile')
        ]
    } ]
}

render((
    <Router
        history={browserHistory}
        routes={rootRoute}
    />
), document.getElementById('app'))


