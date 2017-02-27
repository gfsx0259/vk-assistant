import React, {Component} from 'react'
import axios from 'axios';
import {Link} from 'react-router'

class Dialogs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogs: []
        };
    }

    componentDidMount() {
        axios.get(`/services/dialogs`)
            .then((res) => {
                this.setState({dialogs: res.data.items});
            });
    }

    render() {
        var dialogs = this.state.dialogs.map(function (dialog) {
            return (
                <li key={dialog.uid}>
                    <img src={dialog.contact.photo_200}/>
                    <p>{dialog.body}</p>
                    <p>{dialog.contact.first_name} {dialog.contact.last_name}</p>
                    <Link to={`photos/${dialog.uid}`}>Photos</Link>{' '}
                    <form action="/services/send" method="get">
                        <input name="msg"/>
                        <input name="user_id" type="hidden" value={dialog.uid}/>
                        <input type="submit"/>
                    </form>
                </li>
            );
        });

        return (
            <div>
                <h2>Dialogs</h2>
                <ul>{dialogs}</ul>
            </div>
        )
    }
}

module.exports = Dialogs;
