import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import * as userActions from '../../../actions/user'

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: false
        };
    }

    handleSubmit(event) {
        event.preventDefault();

        const email = this.refs.email.value;
        const pass = this.refs.pass.value;

        this.props.login(email, pass);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit.bind(this)}>
                <div>{this.props.user.processing.toString()}</div>
                <label><input ref="email" placeholder="email" defaultValue="joe@example.com"/></label>
                <label><input ref="pass" placeholder="password"/></label> (hint: password1)<br />
                <button type="submit">login</button>
                {this.state.error && (
                    <p>Bad login information</p>
                )}
            </form>
        )
    }
}

module.exports = connect(
    (state) => ({
        user: state.user
    }),
    (dispatch) => (bindActionCreators(userActions, dispatch))

)(Login);
