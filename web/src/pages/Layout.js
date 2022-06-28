import { Outlet, Link } from "react-router-dom";
import styles from '../styles/Layout.module.css'

const Layout = () => {
  return (
    <>
    <div id={styles.headerBanner}>
        <img id={styles.logo} alt='logo'></img>
        <div id={styles.hamburgerMenuContainer}>
          <button id={styles.hamburgerMenuButton}>Menu</button>
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
            </ul>
          </nav>
        </div>
      </div>

      <Outlet />
    </>
  )
};

export default Layout;