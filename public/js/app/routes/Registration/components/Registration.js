import React, {Component} from 'react'

import auth from '../../../services/auth'

class Registration extends Component {
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


        auth.reg({
            username: email,
            password: pass,
            sex: '0'
        }, (success) => {
            // Если пользователь добавлен в базу - отправляем на страницу входа
            if (success) {
                this.props.router.replace('/login');
            }
        });

    }

    render() {
        return (
            <form onSubmit={this.handleSubmit.bind(this)}>
                <label><input ref="email" name="username" placeholder="joe@example.com" defaultValue=""/></label>
                <label><input ref="pass" name="password" placeholder="password"/></label>
                <select name="sex">
                    <option>Men</option>
                    <option>Girl</option>
                </select>
                <button type="submit">Зарегистрироваться</button>
                {this.state.error && (
                    <p>Bad login information</p>
                )}
            </form>
        )
    }
}

module.exports = Registration;
