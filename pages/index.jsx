import React from 'react';
import Head from 'next/head';
import { Hero } from '../src/components/Hero';
import Layout from '../src/components/Layout';

const Index = () => (
  <>
    <Head>
      <title>Planning Poker</title>
    </Head>
    <Layout>
      <Hero />
    </Layout>
  </>
);

export default Index;