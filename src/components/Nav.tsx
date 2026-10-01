import { useEffect, useRef, useState } from 'react';
import { DISCORD_URL, SITE_LINKS } from '../lib/site-links';
import styles from './Nav.module.css';

interface NavProps {
  currentPath?: string;
}

// `pd` is the non-HttpOnly display-name cookie set alongside the real session
// cookie on login — display only, never trust it for authorization.
function readPlayerCookie(): string | null {
  const pd = document.cookie
    .split('; ')
    .find((c) => c.startsWith('pd='))
    ?.split('=')[1];
  return pd ? decodeURIComponent(pd) : null;
}

export default function Nav({ currentPath = window.location.pathname }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [player] = useState(readPlayerCookie);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);

  const isActive = (href: string) =>
    href === '/' ? currentPath === '/' : currentPath.startsWith(href);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (linksRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.nav}>
      <a href="/" className={styles.brand}>
        <svg
          className={styles.monogram}
          viewBox="0 0 60 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <text
            x="30"
            y="33"
            textAnchor="middle"
            fontFamily="Almendra SC, serif"
            fontSize="28"
            fontWeight="400"
            fill="currentColor"
          >EK</text>
        </svg>
        Emberfall Keep
      </a>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls="nav-links"
        aria-label="Toggle navigation menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <i className={isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} />
      </button>
      <ul
        ref={linksRef}
        id="nav-links"
        className={isOpen ? `${styles.links} ${styles.open}` : styles.links}
      >
        {SITE_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={isActive(link.href) ? styles.active : undefined}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener"
            className={styles.discord}
            onClick={closeMenu}
          >
            <i className="fa-brands fa-discord" /> Discord
          </a>
        </li>
        <li>
          {player ? (
            <>
              <span className={styles.player}>{player}</span>{' '}
              <a href="/api/auth/discord/logout" className={styles.auth}>Logout</a>
            </>
          ) : (
            <a href="/api/auth/discord/login" className={styles.auth}>Login with Discord</a>
          )}
        </li>
      </ul>
    </nav>
  );
}
