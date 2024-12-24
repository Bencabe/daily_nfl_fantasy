import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
      <div className={styles.logo}>Daily EPL Fantasy</div>
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
          <div onClick={() => handleNavigation(`/draft/${user.activeLeague}`)}>Draft</div>
          {/* Other navigation items */}
        </div>
      </div>
    </nav>
  );
};


export default NavBar;
