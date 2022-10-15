import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DarkmodeToggle } from '../DarkmodeToggle';
import { Footer } from '../Footer';
import './common.css';

import * as styles from './layout.module.css';

const Layout = ({ children }) => (
  <>
    <div className={styles.container}>{children}</div>
    <Footer />
    <DarkmodeToggle />
    <ToastContainer
      hideProgressBar={true}
      pauseOnHover={false}
      position={'bottom-right'}
    />
  </>
);
export default Layout;
