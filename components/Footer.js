import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <p>
        Developed by <span className={styles.author}>Gambhir Lairenjam</span> | Owned by <span className={styles.org}>IBS Boarding</span>
      </p>
    </footer>
  );
};

export default Footer;