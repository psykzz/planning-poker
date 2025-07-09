import React from 'react';
import ReactDOM from 'react-dom/client';
import { Hero } from './components/Hero';
import Layout from './components/Layout';
import './components/Layout/common.css';

// Alternative Vite entry point (optional)
// This allows using Vite for development if preferred over Next.js
const App = () => (
  <Layout>
    <Hero />
  </Layout>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);