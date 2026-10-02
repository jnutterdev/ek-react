import { useEffect, type ReactNode } from 'react';
import { SITE_INFO } from '../lib/site-info';
import Footer from './Footer';
import Nav from './Nav';

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

export default function Layout({ title = SITE_INFO.title, children }: LayoutProps) {
  useEffect(() => {
    document.title = title === SITE_INFO.title ? title : `${title} — ${SITE_INFO.title}`;
  }, [title]);

  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
