import React, { Component } from 'react'
import axios from 'axios';

class Photos extends Component {
    constructor(props) {
        super(props);
        alert(345);
        console.log(this.props.params.uid);
        this.state = {
            photos: []
        };
    }
  componentDidMount() {
        axios.get(`/services/photos`)
          .then(res => {
          console.log(res);
      this.setState({photos : res.data.items});
  });
  }
  render() {
      var photos = this.state.photos.map(function(photo) {
          return (
              <li key={photo.id}><img src={photo.src}/></li>
          );
      });
    return (
      <div>
          <h5>{this.props.params.uid}</h5>
        <h2>Photos</h2>
        {photos}
      </div>
    )
  }
}

module.exports = Photos
