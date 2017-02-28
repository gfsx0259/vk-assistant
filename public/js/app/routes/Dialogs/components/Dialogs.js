import React, {Component} from 'react'
import axios from 'axios';
import {Link} from 'react-router'

import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import * as dialogsActions from '../../../actions/dialogs'

class Dialogs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogs: []
        };
    }

    componentDidMount() {
        this.props.fetch();
        // axios.get(`/services/dialogs`)
        //     .then((res) => {
        //         this.setState({dialogs: res.data.items});
        //     });
    }

    render() {

        <div>{this.props.dialogs.processing ? 'Загрузка' : '+++'}</div>
        var dialogs = this.props.dialogs.list.map(function (dialog) {
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


module.exports = connect(
    (state) => ({
        dialogs: state.dialogs
    }),
    (dispatch) => (bindActionCreators(dialogsActions, dispatch))

)(Dialogs);
