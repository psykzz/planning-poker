import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Footer } from '../Footer';

import * as styles from './layout.module.css';

const Layout = ({ children }) => (
  <div className={styles.page_shell}>
    <div className={styles.container}>
      <main className={styles.main}>{children}</main>
    </div>
    <Footer />
    <ToastContainer
      hideProgressBar={true}
      pauseOnHover={false}
      position={'bottom-right'}
    />
  </div>
);
export default Layout;
