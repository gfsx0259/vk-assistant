import React, {Component} from 'react'
import {Link} from 'react-router'

import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import * as dialogsActions from '../../../actions/dialogs'

const styles = {};

styles.dialogRowLeft = {
    display: 'inline-block',
};

styles.dialogRowAvatar = {
    width:'50px',
    borderRadius: '50px',
    marginRight: '15px'
};

styles.userName = {
    fontSize: '14px'
};

styles.dialogRowRight = {
    fontFamily: 'Arial',
    display: 'inline-block',
    verticalAlign: 'top'
};

styles.list = {
    listStyleType: 'none'
};

class Dialogs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogs: []
        };
    }

    componentDidMount() {
        this.props.fetch();
    }

    render() {
        <div>{this.props.dialogs.processing ? 'Загрузка' : '+++'}</div>
        var dialogs = this.props.dialogs.list.map(function (dialog) {
            return (
                <li key={dialog.uid}>
                    <div style={styles.dialogRowLeft}>
                        <img src={dialog.contact.photo_200} style={styles.dialogRowAvatar}/>
                    </div>
                    <div style={styles.dialogRowRight}>
                        <b style={styles.userName}>{dialog.contact.first_name} {dialog.contact.last_name} </b>
                        <Link to={`photos/${dialog.uid}`}>[Фотографии]</Link>
                        <p>{dialog.body}</p>
                    </div>
                    {/*<form action="/services/send" method="get">*/}
                        {/*<input name="msg"/>*/}
                        {/*<input name="user_id" type="hidden" value={dialog.uid}/>*/}
                        {/*<input type="submit"/>*/}
                    {/*</form>*/}
                </li>
            );
        });
        return (
            <div>
                <ul style={styles.list}>{dialogs}</ul>
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
