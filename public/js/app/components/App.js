import React, {Component} from 'react'

import Dashboard from './Dashboard'
import GlobalNav from './GlobalNav'

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <GlobalNav />
                <div style={{padding: 20}}>
                    {this.props.children || <Dashboard/>}
                </div>
            </div>
        )
    }
}

module.exports = App;