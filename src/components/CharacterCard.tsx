import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  name: string;
  player: string;
  characterClass?: string;
  level?: number;
  race?: string;
  active?: boolean;
  portrait?: string;
  href: string;
}

export default function CharacterCard({
  name,
  player,
  characterClass,
  level,
  race,
  active = true,
  portrait,
  href,
}: CharacterCardProps) {
  return (
    <a className={styles.card} href={href}>
      <div className={styles.portrait}>
        {portrait
          ? <img src={portrait} alt={name} className={styles.img} />
          : <i className={`fa-solid fa-user ${styles.placeholder}`} />
        }
        {!active && (
          <span className={styles.deceased}><i className="fa-solid fa-skull" /></span>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{name}</div>
        <div className={styles.sub}>
          {race && <span>{race}</span>}
          {characterClass && <span>{characterClass}{level ? ` ${level}` : ''}</span>}
        </div>
        <div className={styles.player}>
          <i className="fa-solid fa-user-group" /> {player}
        </div>
      </div>
    </a>
  );
}
