import React from 'react';
import { Hero } from '../components/Hero';
import Layout from '../components/Layout';

const Index = () => (
  <Layout>
    <Hero />
  </Layout>
);
export default Index;

export const Head = () => {
  return <title>Planning Poker</title>;
};