import  React, { Component } from 'react'
import { Link } from 'react-router'

class Dashboard extends Component {
  render() {
    const { courses } = this.props

    return (
      <div>
        <h2>Главная страница</h2>
        <p>
          Привет!
        </p>
      </div>
    )
  }
}

export default Dashboard
