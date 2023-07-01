import { Outlet, Link } from "react-router-dom";
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {logOut} from '../pages/Login/LoginReducer'
import styles from '../styles/Layout.module.css'

class Layout extends Component {
  constructor(props) {
    super(props)
  }
  state = {
  }

  render() {
    return(
    <>
    <div id={styles.headerBanner}>
        {/* <img id={styles.logo} alt='logo'></img> */}
        <div id={styles.logo}>Finest Fantasy Sports</div>
        <div id={styles.hamburgerMenuContainer}>
          <button id={styles.hamburgerMenuButton}>          
            <span className={styles.line}></span>
            <span className={styles.line}></span>
            <span className={styles.line} id={styles.lastLine}></span>
          </button>
          <nav id={styles.hamburgerMenu}>
            <ul>
              <li>
                <Link to="/">Team</Link>
              </li>
              <li>
                <Link to="/league">League</Link>
              </li>
              <li>
                <Link to="/fixtures">Fixtures</Link>
              </li>
              <li>
                <Link to="/" onClick={() => this.props.logOut()}>Logout</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div id={styles.currentPage}>
        <div id={styles.currentPageContent}>
          <Outlet />
        </div>
      </div>
    </>
    );
    }
};

const mapStateToProps = state => ({
  user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
  loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
});

const mapDispatchtoPros = () => {
  return {
    logOut
  };
}

export default connect(mapStateToProps, mapDispatchtoPros())(Layout);