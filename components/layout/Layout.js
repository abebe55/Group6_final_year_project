import Head from 'next/head';
import Navbar from './Navbar';

export default function Layout({ children, title = 'North Wollo Tourism' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Explore North Wollo Tourism" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
