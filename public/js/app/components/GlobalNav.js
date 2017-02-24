import React, {Component} from 'react'
import {Link} from 'react-router'

import auth from '../services/auth'

const dark = 'hsl(200, 20%, 20%)';
const light = '#fff';
const styles = {};

styles.wrapper = {
    padding: '10px 20px',
    overflow: 'hidden',
    background: dark,
    color: light
};

styles.link = {
    padding: 11,
    color: light,
    fontWeight: 200
};

styles.activeLink = {
    background: light,
    color: dark
};


class GlobalNav extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            loggedIn: false
        };
    }

    updateAuth(loggedIn, user) {
        this.setState({
            loggedIn: loggedIn,
            user: user
        })
    }

    componentWillMount() {
        auth.onChange = this.updateAuth.bind(this);
        auth.login();
    }

    logOut() {
        auth.logout()
    }

    render() {
        return (
            <div style={styles.wrapper}>
                <div style={{float: 'left'}}>
                    <Link to="/" style={styles.link}>Home</Link>
                    {this.state.loggedIn &&
                    <div style={{float: 'right'}}>
                        <Link to="/dialogs" style={styles.link} activeStyle={styles.activeLink}>Dialogs</Link>
                        <Link to="/messages" style={styles.link} activeStyle={styles.activeLink}>Messages</Link>
                        <Link to="photos" style={styles.link} activeStyle={styles.activeLink}>Photos</Link>
                    </div>
                    }
                </div>
                <div style={{float: 'right'}}>
                    {this.state.loggedIn ? (
                            <div>
                                <Link style={styles.link} to="/profile">{this.state.user}</Link>
                                <button onClick={() => this.logOut()}>log out</button>
                            </div>
                        ) : (
                            <div>
                                <Link style={styles.link} to="/login">Sign in</Link>
                                <Link style={styles.link} to="/reg">Sign up</Link>
                            </div>
                        )}
                </div>
            </div>
        )
    }
}

export default GlobalNav
