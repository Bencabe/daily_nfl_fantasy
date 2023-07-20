import React, {Component} from 'react'
import styles from '../../styles/Login.module.css'
import nfl_logo from './nfl_logo.jpeg'
import {getUser, registerUser} from '../../middleware/users'
import { logIn, logOut, setUser } from './LoginReducer'
import { connect } from 'react-redux'
import _ from 'lodash'



class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loginDetails: {
                email: '',
                password: '',
            },
            registerDetails: {
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
            },
            errorMessage: '',
            value: false}
    }

    updateState(event, statePath) {
        this.setState(_.set(this.state, statePath, event.target.value));
    }

    saveUser(user) {
        window.localStorage.setItem('user', JSON.stringify(user))
        window.localStorage.setItem('loggedIn', true)
    }

    checkUser() {
        getUser(this.state.loginDetails.email).then((user) => {
            if (user.length == 0) {
                this.setState({errorMessage:'User not registered'})
            }
            else if (user[0][4] != this.state.loginDetails.password){
                this.setState({errorMessage:'Incorrect Password'})
            }
            else {
                this.props.setUser(user)
                this.props.logIn()
            }
        })
    }

    async registerUser() {
        this.setState({errorMessage: null})
        const user = await getUser(this.state.registerDetails.email)
        if (!_.isEmpty(user)) {
            this.setState({errorMessage: 'User already registered'})
        }
        else if (this.state.registerDetails.password !== this.state.registerDetails.confirmPassword) {
            this.setState({errorMessage: 'Passwords don\'t match'})
        }
        else {
            const result = await registerUser(this.state.registerDetails)
            this.setState({errorMessage: result.message})

        }
    }

    render() {
        return(
            <div className={styles.loginregister}>
                <div className={styles.login}>
                    <h3>Sign In</h3> <br/>
                    <form>
                        <label>Email<br/>
                            <input id='user-email' type="text" value={this.state.loginDetails.email} onChange={event => this.updateState(event, 'loginDetails.email')}/>
                        </label><br/>
                        <label>Password<br/>
                            <input id='user-password' type="text" value={this.state.loginDetails.password} onChange={event => this.updateState(event, 'loginDetails.password')}/>
                        </label>
                    </form><br/>
                    <button onClick={ () => this.checkUser() }> Sign In </button> 
                    <p id={styles.errormessage}>{this.state.errorMessage}</p>
                </div>
                <div className={styles.register}>
                    <h3>Register</h3> <br/>
                    <form>
                        <label>First Name<br/>
                            <input  type="text" value={this.state.registerDetails.firstName} onChange={event => this.updateState(event, 'registerDetails.firstName')}/>
                        </label><br/>
                        <label>Last Name<br/>
                            <input type="text"  value={this.state.registerDetails.lastName} onChange={event => this.updateState(event, 'registerDetails.lastName')}/>
                        </label><br/>
                        <label>Email<br/>
                            <input type="text" value={this.state.registerDetails.email} onChange={event => this.updateState(event, 'registerDetails.email')}/>
                        </label><br/>
                        <label>Password<br/>
                            <input type="text" value={this.state.registerDetails.password} onChange={event => this.updateState(event, 'registerDetails.password')}/>
                        </label><br/>
                        <label>Confirm Password<br/>
                            <input type="text" value={this.state.registerDetails.confirmPassword} onChange={event => this.updateState(event, 'registerDetails.confirmPassword')}/>
                        </label>
                    </form><br/>
                    <button onClick={ () => this.registerUser() }> Sign Up </button> 
                </div>
            </div>
            
        );
    }
}
const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
});
const mapDispatchToProps = () => {
    return { 
        logIn, 
        logOut,
        setUser,
};}
export default connect(mapStateToProps,mapDispatchToProps())(Login);