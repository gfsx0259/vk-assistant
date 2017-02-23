import React, { Component } from 'react'
import axios from 'axios';

const styles = {};

styles.item = {
    display: 'inline-block'
};

class Photos extends Component {
    constructor(props) {
        super(props);
        console.log(this.props.params.uid);
        this.state = {
            photos: []
        };
    }
  componentDidMount() {
        axios.get(`/services/photos`,
            {params: {owner_id: this.props.params.uid}})
          .then(res => {
          console.log(res);
      this.setState({photos : res.data.items});
  });
  }
  likeAll() {
        let pids = this.state.photos.map(function(photo){ return photo.pid; })

        axios.post(`/services/setLike`,
            {
                 owner_id: this.props.params.uid,
                 pids: pids
            })
          .then(res => {
              alert('Запрос отправлен');
          });
  }
  render() {
      var photos = this.state.photos.map(function(photo) {
          return (
              <li style={styles.item} key={photo.id} data-owner-id={photo.owner_id} data-pid={photo.pid}><img src={photo.src}/></li>
          );
      });
    return (
      <div>
          <h5>{this.props.params.uid}</h5>
        <h2>Photos</h2>
          <button onClick={this.likeAll.bind(this)}>Мне нравится</button>
        {photos}
      </div>
    )
  }
}

module.exports = Photos
