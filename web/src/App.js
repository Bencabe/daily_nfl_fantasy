import logo from './logo.svg';
import './App.css';
import React, {Component} from 'react'
import Login from './Login/Login'
import Main from './Main/Main'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {userAuthenticated: false}
    this.updateUserAuthentication = this.updateUserAuthentication.bind(this);
  }

  updateUserAuthentication = ()  => {
    this.setState({userAuthenticated: true}) 
    console.log(this.state)
  }

  render() {
    return(
      <div>
        {this.state.userAuthenticated ?   <Main /> : <Login updateUserAuthentication={this.updateUserAuthentication}/>}
      </div>
    );
  }
}

export default App;
