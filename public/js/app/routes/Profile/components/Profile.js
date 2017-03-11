import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import * as profileActions from '../../../actions/profile'

class Profile extends Component {
    componentDidMount() {
        this.props.fetchContact();
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
                <div>{this.props.profile.processing.toString()}</div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label>Имя пользователя<input ref="username" placeholder="email"/></label>
                    <label>Пароль<input ref="pass" placeholder="password"/></label> (hint: password1)<br />
                    <button type="submit">Сохранить</button>
                </form>

                {this.props.profile.contact && <div>
                    <img src={this.props.profile.contact.photo_200} />
                    {this.props.profile.contact.first_name}
                    {this.props.profile.contact.last_name}
                </div>}


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
