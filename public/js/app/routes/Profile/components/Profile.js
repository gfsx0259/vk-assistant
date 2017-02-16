import React, { Component } from 'react'
import axios from 'axios';

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            profile: {}
        };
    }
    componentDidMount() {
        axios.get(`/services/profile`)
            .then(res => {
                console.log(res);
                this.setState({profile : res.data.profile});
            });
    }
    render() {
        return (
            <div>
              <h2>Profile</h2>
                <img src={this.state.profile.photo_200} />
                {this.state.profile.first_name}
                {this.state.profile.last_name}
            </div>
        )
    }
}

module.exports = Profile
