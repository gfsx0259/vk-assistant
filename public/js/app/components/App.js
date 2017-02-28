import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import Dashboard from './Dashboard'
import GlobalNav from './GlobalNav'

import * as userActions from '../actions/user'

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {name, authorized} = this.props.user;
        return (
            <div>
                <p>Привет из App, {name} {authorized.toString()}!</p>
                <GlobalNav user={this.props.user} logout={this.props.userActions.logout}/>
                <div style={{padding: 20}}>
                    {this.props.children || <Dashboard/>}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch)
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(App);