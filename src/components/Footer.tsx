import { DISCORD_URL, SITE_LINKS } from '../lib/site-links';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>Emberfall Keep</span>
      <ul className={styles.links}>
        {SITE_LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
        <li>
          <a href={DISCORD_URL} target="_blank" rel="noopener" className={styles.discord}>
            <i className="fa-brands fa-discord" /> Discord
          </a>
        </li>
      </ul>
      <p className={styles.motto}>In Omnia Paratus &middot; Est. 2026</p>
    </footer>
  );
}
