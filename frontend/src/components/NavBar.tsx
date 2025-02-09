import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';
import { useGlobalContext } from '../utils/customHooks';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useGlobalContext();

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    // Use current page values in navigation

    navigate(path);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Fantasy EPL</div>
      <div className={styles.menuContainer}>
        <button 
          className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`${styles.dropdown} ${isOpen ? styles.show : ''}`}>
          <div onClick={() => handleNavigation("/")}>Home</div>
          <div onClick={() => handleNavigation(`/player_select`)}>Player Select</div>
          <div onClick={() => handleNavigation(`/league_fixtures`)}>League Fixtures</div>
          <div onClick={() => handleNavigation(`/league_table`)}>League Table</div>
          <div onClick={() => handleNavigation(`/league_management`)}>League Management</div>
          <div onClick={() => handleNavigation(`/draft/${user.activeLeague}`)}>Draft</div>
          <div onClick={() => handleNavigation(`/info`)}>Info</div>
        </div>
      </div>
    </nav>
  );
};


export default NavBar;
