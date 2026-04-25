import Head from 'next/head';
import '../src/components/Layout/common.css';
import 'react-toastify/ReactToastify.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
