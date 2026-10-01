import { useEffect, type ReactNode } from 'react';
import Footer from './Footer';
import Nav from './Nav';

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

const SITE_NAME = 'Emberfall Keep';

export default function Layout({ title = SITE_NAME, children }: LayoutProps) {
  useEffect(() => {
    document.title = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
  }, [title]);

  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
