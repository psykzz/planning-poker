import React from 'react';
import { Helmet } from 'react-helmet';
import { toast, ToastContainer } from 'react-toastify';
import { DarkmodeToggle } from '../DarkmodeToggle';
import { Footer } from '../Footer';
import './common.css';
import 'react-toastify/dist/ReactToastify.css';

import * as styles from './layout.module.css';

const Layout = ({ children }) => (
  <>
    <Helmet>
      <title>Planning Poker</title>
    </Helmet>
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
