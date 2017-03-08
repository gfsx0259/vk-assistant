import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import axios from 'axios';

import * as profileActions from '../../../actions/profile'

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            profile: {}
        };
    }
    componentDidMount() {
        axios.get(`/services/profile`)
            .then((res) => {
                this.setState({profile : res.data.profile});
            });
    }
    handleSubmit(event) {
        event.preventDefault();

        const username = this.refs.username.value;
        const pass = this.refs.pass.value;

        this.props.saveMapping({username:username, password: pass});
    }
    render() {
        return (
            <div>
              <h2>Profile</h2>
                <h3>Данные пользоваетля ВК</h3>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label>Имя пользователя<input ref="username" placeholder="email"/></label>
                    <label>Пароль<input ref="pass" placeholder="password"/></label> (hint: password1)<br />
                    <button type="submit">Сохранить</button>
                </form>


                <img src={this.state.profile.photo_200} />
                {this.state.profile.first_name}
                {this.state.profile.last_name}
            </div>
        )
    }
}

module.exports = connect(
    (state) => ({
        profile: state.profile
    }),
    (dispatch) => (bindActionCreators(profileActions, dispatch))

)(Profile);
