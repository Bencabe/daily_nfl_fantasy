import React, {Component} from 'react'
import styles from '../../styles/Login.module.css'
import nfl_logo from './nfl_logo.jpeg'
import {getUser} from '../../middleware/users'
import { useSelector, useDispatch } from 'react-redux'
import { logIn, logOut, setUser } from './LoginReducer'
import { connect } from 'react-redux'



class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {email: '',
        password: '',
        first_name: '',
        last_name: '',
        error_message: '',
        value: false}
    }
    updateEmail(event) {
        this.setState({ email: event.target.value });
    }
    updatePassword(event) {
        this.setState({ password: event.target.value });
    }

    saveUser = (user) => {
        window.localStorage.setItem('user', JSON.stringify(user))
        window.localStorage.setItem('loggedIn', true)
    }

    checkUser = (userEmail) => {

        getUser(userEmail).then((user) => {
            if (user.length == 0) {
                this.setState({error_message:'User not registered'})
            }
            else if (user[0][4] != this.state.password){
                this.setState({error_message:'Incorrect Password'})
            }
            else {
                this.props.setUser(user)
                this.props.logIn()
                // console.log(JSON.parse(window.localStorage.getItem('loggedIn')))
            }
        })
    }

    render() {
        return(
            <div className={styles.loginregister}>
                <div className={styles.logocontainer}>
                    <img src={nfl_logo} alt="nfl_logo" />
                </div>
                <div className={styles.login}>
                    <h3>Sign In</h3> <br/>
                    <form>
                        <label>Email<br/>
                            <input id='user-email' type="text" value={this.state.email} onChange={this.updateEmail.bind(this)}/>
                        </label><br/>
                        <label>Password<br/>
                            <input id='user-password' type="text" value={this.state.password} onChange={this.updatePassword.bind(this)}/>
                        </label>
                    </form><br/>
                    <button onClick={ () => this.checkUser(this.state.email) }> Sign In </button> 
                    <p id={styles.errormessage}>{this.state.error_message}</p>
                </div>
                <div className={styles.register}>
                    <h3>Register</h3> <br/>
                    <form>
                        <label>First Name<br/>
                            <input  type="text" />
                        </label><br/>
                        <label>Last Name<br/>
                            <input type="text" />
                        </label><br/>
                        <label>Email<br/>
                            <input type="text" value={this.state.email} onChange={this.updateEmail.bind(this)}/>
                        </label><br/>
                        <label>Password<br/>
                            <input type="text" />
                        </label><br/>
                        <label>Confirm Password<br/>
                            <input type="text" />
                        </label>
                    </form><br/>
                    <button> Sign Up </button> 
                </div>
            </div>
            
        );
    }
}
const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    // loggedIn: state.loggedIn || JSON.parse(window.localStorage.getItem('loggedIn')),
    loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
});
const mapDispatchToProps = () => {
    return { 
        logIn, 
        logOut,
        setUser,
};}
export default connect(mapStateToProps,mapDispatchToProps())(Login);