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
        {this.props.loggedIn ?   <Main /> : <Login store={this.props.store} updateUserAuthentication={this.updateUserAuthentication}/>}
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
  // loggedIn: state.loggedIn || JSON.parse(window.localStorage.getItem('loggedIn')),
  loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
  // items: state.App.Items.List,
  // filters: state.App.Items.Filters,
  //the State.App & state.App.Items.List/Filters are reducers used as an example.
})

export default connect(mapStateToProps)(App);