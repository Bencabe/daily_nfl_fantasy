import { Outlet, Link } from "react-router-dom";
import styles from '../styles/Layout.module.css'

const Layout = () => {
  return (
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
  )
};

export default Layout;