import React, {Component} from 'react'
import axios from 'axios';

class Messages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
    }

    componentDidMount() {
        axios.get(`/services/msg`)
            .then((res) => {
                this.setState({messages: res.data.items});
            });
    }

    render() {
        var messages = this.state.messages.map(function (msg) {
            return (
                <li key={msg.mid}>{msg.body}</li>
            );
        });
        return (
            <div>
                <h2>Messages</h2>
                <ul>{messages}</ul>
            </div>
        )
    }
}

module.exports = Messages;
