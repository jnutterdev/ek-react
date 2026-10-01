import styles from './CampaignCard.module.css';

export type CampaignStatus = 'Active' | 'Archived' | 'Planned';

interface CampaignCardProps {
  title: string;
  status: CampaignStatus;
  tagline?: string;
  sessionCount?: number;
  system?: string;
  href: string;
}

const STATUS_CLASS: Record<CampaignStatus, string> = {
  Active: 'badge-teal',
  Archived: 'badge-muted',
  Planned: 'badge-gold',
};

export default function CampaignCard({
  title,
  status,
  tagline,
  sessionCount = 0,
  system = 'D&D 5e',
  href,
}: CampaignCardProps) {
  return (
    <a className={styles.card} href={href}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={`badge ${STATUS_CLASS[status]}`}>{status}</span>
      </div>
      {tagline && <p className={styles.tagline}>{tagline}</p>}
      <div className={styles.meta}>
        <span><i className="fa-solid fa-scroll" /> {sessionCount} sessions</span>
        <span><i className="fa-solid fa-dice-d20" /> {system}</span>
      </div>
    </a>
  );
}
