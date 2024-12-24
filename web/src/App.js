import logo from './logo.svg';
import './App.css';
import React, {Component} from 'react'
import Login from './pages/Login/Login'
import Main from './pages/Main'
import {connect} from 'react-redux'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.store.getState()
  }



  render() {
    return(
        <div>
          {this.props.loggedIn ? <Main /> : <Login store={this.props.store} updateUserAuthentication={this.updateUserAuthentication}/>}
        </div>
    );
  }
}
const mapStateToProps = (state) => ({
  user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
  loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
})

export default connect(mapStateToProps)(App);