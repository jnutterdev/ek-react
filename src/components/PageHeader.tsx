import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  children,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div>
          {backHref && (
            <a href={backHref} className={styles.back}>
              <i className="fa-solid fa-chevron-left" /> {backLabel ?? 'Back'}
            </a>
          )}
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.actions}>
          {children}
        </div>
      </div>
    </header>
  );
}
