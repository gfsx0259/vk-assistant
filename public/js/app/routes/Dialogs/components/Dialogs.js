import React, { Component } from 'react'
import axios from 'axios';

class Dialogs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogs: []
        };
    }
    componentDidMount() {
        axios.get(`/services/dialogs`)
            .then(res => {
                console.log(res);
                this.setState({dialogs : res.data.items});
            });
    }
    render() {
        var dialogs = this.state.dialogs.map(function(dialog) {
            return (
            <li key={dialog.uid}>
              <img src={dialog.info.photo_200}/>
              <p>{dialog.body}</p>
              <p>{dialog.info.first_name} {dialog.info.last_name}</p>
              <form action="/services/send" method="get">
                <input name="msg"/>
                <input name="user_id" type="hidden" value="{{uid}}"/>
                <input type="submit"/>
              </form>
            </li>
            );
        });

        return (
            <div>
              <h2>Dialogs</h2>
                {dialogs}
            </div>
        )
    }
}

module.exports = Dialogs
