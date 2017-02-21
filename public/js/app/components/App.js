import React, { Component } from 'react'
import { Link } from 'react-router'

import Dashboard from './Dashboard'
import GlobalNav from './GlobalNav'

import auth from '../services/auth'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: auth.loggedIn()
        };
    }
    updateAuth(loggedIn) {
        this.setState({
            loggedIn
        })
    }
    componentWillMount() {
        auth.onChange = this.updateAuth.bind(this)
        auth.login()
    }
    render() {
        console.log(this.props.children );
        return (
            <div>
            <GlobalNav />
            <div style={{ padding: 20 }}>
        {this.props.children || <Dashboard/>}
    </div>
        </div>
    )
    }
}

module.exports = App;