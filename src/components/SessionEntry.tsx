import styles from './SessionEntry.module.css';

interface SessionEntryProps {
  title: string;
  sessionNumber: number;
  date: Date;
  summary?: string;
  partyPresent?: string[];
  href: string;
}

export default function SessionEntry({
  title,
  sessionNumber,
  date,
  summary,
  partyPresent = [],
  href,
}: SessionEntryProps) {
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

  return (
    <a className={styles.entry} href={href}>
      <div className={styles.num}>
        <span className={styles.numeral}>{String(sessionNumber).padStart(2, '0')}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {summary && <p className={styles.summary}>{summary}</p>}
        <div className={styles.meta}>
          <span><i className="fa-regular fa-calendar" /> {formattedDate}</span>
          {partyPresent.length > 0 && (
            <span><i className="fa-solid fa-users" /> {partyPresent.join(', ')}</span>
          )}
        </div>
      </div>
      <div className={styles.arrow}>
        <i className="fa-solid fa-chevron-right" />
      </div>
    </a>
  );
}
