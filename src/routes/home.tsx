import { useEffect, useRef, useState } from 'react';
import chroniclesImage from '../assets/uploads/top-view-beautiful-rpg-still-life-items.jpg';
import campaignCover from '../assets/uploads/il_1080xN.6066344386_i65b.webp';
import harlanPortrait from '../assets/uploads/IMG-20260224-WA00031.png';
import jamrickPortrait from '../assets/uploads/orca-image-745203433.jpeg.png';
import maysPortrait from '../assets/uploads/IMG-20260319-WA00001.png';
import pierrePortrait from '../assets/uploads/IMG-20260224-WA00012.png';
import riceaPortrait from '../assets/uploads/Ranger_and_dog_in_the_woodland.jpg';
import styles from './home.module.css';

// ── Placeholder data ──────────────────────────────────────────────────────────
// Stand-ins for the Astro content collections. Phase 3 replaces these with
// `useLoaderData()` from this route's loader.
interface Campaign {
  slug: string;
  title: string;
  tagline?: string;
  system: string;
  setting?: string;
  description?: string;
  coverImage?: string;
  lastSession?: Date;
  partySize?: number;
}

interface Character {
  slug: string;
  name: string;
  characterClass?: string;
  level?: number;
  portrait?: string;
}

interface Session {
  slug: string;
  title: string;
  sessionNumber: number;
  date?: Date;
  summary?: string;
  xp?: number;
  partyPresent?: string[];
}

const activeCampaign: Campaign = {
  slug: 'a-veil-of-secrecy',
  title: 'A veil of secrecy',
  tagline: 'Woke up dead. Ended up in Sigil.',
  system: '5e',
  setting: 'Sigil',
  description: 'A battle of life and rebirth, fighting inside of Greyhawk.',
  coverImage: campaignCover,
  lastSession: new Date('2026-07-25'),
  partySize: 6,
};

const characters: Character[] = [
  { slug: 'harlan-stone', name: 'Harlan Stone', characterClass: 'Druid', level: 3, portrait: harlanPortrait },
  { slug: 'jamrick-fizzlebang', name: 'Jamrick Fizzlebang', characterClass: 'Artificer', level: 3, portrait: jamrickPortrait },
  { slug: 'mays', name: 'Mays', characterClass: 'Rogue', level: 3, portrait: maysPortrait },
  { slug: 'pierre-devereux', name: 'Pierre Devereux', characterClass: 'Pugelist', level: 3, portrait: pierrePortrait },
  { slug: 'ricea-rhonie', name: 'Ricea Rhonie', characterClass: 'Ranger', level: 3, portrait: riceaPortrait },
];

// Newest first
const allSessions: Session[] = [
  {
    slug: 'session-004',
    title: 'The Wrong Chord Home',
    sessionNumber: 4,
    date: new Date('2026-06-26'),
    summary: 'A new bard named Clover joined the party, played a chord that made everyone glow, and the night ended in an ambush on the way home.',
    partyPresent: ['Ricea Rhonie', 'Harlan Stone', 'Jamrick Fizzlebang', 'Pierre Devereux', 'Mays', 'Clover'],
  },
  {
    slug: 'session-003',
    title: 'Concert Chaos at the Splintered Drum',
    sessionNumber: 3,
    date: new Date('2026-05-29'),
    summary: "Security work at a Hive concert spiraled into biker gangs, a live bomb, and a shocking reveal when Cinder's helmet came off.",
    partyPresent: ['Ricea Rhonie', 'Harlan Stone', 'Jamrick Fizzlebang', 'Pierre Devereux', 'Mays'],
  },
  {
    slug: 'session-002',
    title: 'Out of the Wombs, Into the Cage',
    sessionNumber: 2,
    date: new Date('2026-04-24'),
    summary: 'The party fought free of the corpse-lab, fled a sword-wielding fiend, and stumbled into the impossible city of Sigil.',
    partyPresent: ['Ricea Rhonie', 'Harlan Stone', 'Pierre Devereux', 'Mays'],
  },
  {
    slug: 'session-001',
    title: 'Terminate the Subjects',
    sessionNumber: 1,
    date: new Date('2026-03-27'),
    xp: 150,
  },
];

const compendiumCounts = { npcs: 20, factions: 3, items: 3 };

// ── Helpers ───────────────────────────────────────────────────────────────────
function toRoman(num: number): string {
  if (!num || num <= 0) return '–';
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}

function fmtDate(d: Date | undefined): string {
  if (!d) return '–';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function stripSessionPrefix(title: string): string {
  const idx = title.indexOf(' — ');
  return idx >= 0 ? title.slice(idx + 3) : title;
}

function classIcon(cls: string | undefined): string {
  const map: Record<string, string> = {
    Fighter:        'fa-shield-halved',
    Paladin:        'fa-shield-halved',
    Barbarian:      'fa-fire',
    Wizard:         'fa-wand-sparkles',
    Sorcerer:       'fa-star',
    Warlock:        'fa-eye',
    Bard:           'fa-music',
    Cleric:         'fa-cross',
    Druid:          'fa-leaf',
    Ranger:         'fa-bow-arrow',
    Rogue:          'fa-skull',
    Monk:           'fa-hand-fist',
    'Blood Hunter': 'fa-droplet',
    Artificer:      'fa-gears',
  };
  return map[cls ?? ''] ?? 'fa-person';
}

// ── Fellowship scroller ───────────────────────────────────────────────────────
const OVERFLOW_TOLERANCE = 4; // px — avoids flicker from subpixel rounding

function usePortraitScroll() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [nav, setNav] = useState({ visible: false, atStart: true, atEnd: true });

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    function update() {
      if (!grid) return;
      const maxScroll = grid.scrollWidth - grid.clientWidth;
      setNav({
        visible: maxScroll > OVERFLOW_TOLERANCE,
        atStart: grid.scrollLeft <= OVERFLOW_TOLERANCE,
        atEnd: grid.scrollLeft >= maxScroll - OVERFLOW_TOLERANCE,
      });
    }

    grid.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      grid.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  function scrollBy(direction: 1 | -1) {
    const grid = gridRef.current;
    grid?.scrollBy({ left: direction * grid.clientWidth, behavior: 'smooth' });
  }

  return { gridRef, nav, scrollBy };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const recentSessions = allSessions.slice(0, 3);
  const latestSession = allSessions[0];
  const { gridRef, nav, scrollBy } = usePortraitScroll();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroArt}>
          <svg className={styles.monogram} viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="140" cy="100" r="96" stroke="currentColor" strokeWidth="0.8" opacity="0.4" fill="none" />
            <circle cx="140" cy="100" r="90" stroke="currentColor" strokeWidth="0.8" opacity="0.4" fill="none" />
            <text
              x="140"
              y="150"
              textAnchor="middle"
              fontFamily="Almendra SC, serif"
              fontSize="130"
              fontWeight="400"
              fill="currentColor"
              opacity="0.9"
            >EK</text>
          </svg>
        </div>

        <div className={`${styles.heroContent} wrap`}>
          <div>
            <div className={styles.pillActive}>Active Campaign</div>
            <h1 className={styles.heroTitle}>{activeCampaign.title}</h1>
          </div>
          <div className={styles.heroRight}>
            <p className={styles.heroTagline}>
              {activeCampaign.tagline ?? 'Where campaigns are forged and legends remembered.'}
            </p>
            <div className={styles.heroActions}>
              <a href="#chronicles" className={styles.heroLink}>Latest Session</a>
              <a href="#campaign" className={styles.heroLink}>Campaign Detail</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE CAMPAIGN ─────────────────────────────────────────────────── */}
      <section className={styles.campaign} id="campaign">
        <div className="wrap">
          <h2 className="section-label">The Campaign</h2>
          <div className={styles.campaignInner}>
            <div className={styles.campaignImage}>
              {activeCampaign.coverImage
                ? <img src={activeCampaign.coverImage} alt={activeCampaign.title} className={styles.coverImg} />
                : <i className="fa-solid fa-map" />}
            </div>

            <div className={styles.campaignText}>
              <p className={styles.campaignMeta}>
                <i className="fa-solid fa-compass" />
                &nbsp;{activeCampaign.setting ?? activeCampaign.system}
                &nbsp;&middot;&nbsp;Session {toRoman(allSessions.length)}
                &nbsp;&middot;&nbsp;{activeCampaign.system}
              </p>

              <h3 className={styles.campaignTitle}>{activeCampaign.title}</h3>
              <p className={styles.campaignSubtitle}>
                {activeCampaign.tagline ?? 'A campaign of intrigue, ruin, and reckoning'}
              </p>

              {(latestSession?.summary || activeCampaign.description) && (
                <p className={styles.campaignDesc}>
                  {latestSession?.summary && <span className={styles.campaignDescLabel}>Last time —</span>}
                  {' '}{latestSession?.summary ?? activeCampaign.description}
                </p>
              )}

              <div className={styles.campaignStats}>
                <div className={styles.campaignStat}>
                  <span className={styles.lbl}>Sessions</span>
                  <span className={styles.val}>{toRoman(allSessions.length)}</span>
                </div>
                <div className={styles.campaignStat}>
                  <span className={styles.lbl}>Last Played</span>
                  <span className={styles.val}>{fmtDate(activeCampaign.lastSession)}</span>
                </div>
                <div className={styles.campaignStat}>
                  <span className={styles.lbl}>Party Size</span>
                  <span className={styles.val}>{(activeCampaign.partySize ?? characters.length) || '–'}</span>
                </div>
                <div className={styles.campaignStat}>
                  <span className={styles.lbl}>System</span>
                  <span className={styles.val}>{activeCampaign.system}</span>
                </div>
              </div>

              {latestSession && (
                <a href={`/sessions/${latestSession.slug}`} className="btn btn-primary">
                  <i className="fa-solid fa-scroll" /> Latest Session
                </a>
              )}
              <a href="/sessions" className="btn btn-ghost">
                <i className="fa-solid fa-dungeon" /> Full Campaign
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE FELLOWSHIP ───────────────────────────────────────────────── */}
      <section className={styles.fellowship} id="fellowship">
        <div className="wrap">
          <div className={styles.fellowshipIntro}>
            <h2 className="section-label">The Fellowship</h2>
            <p className={styles.fellowshipTagline}>
              {characters.length > 0
                ? `${characters.length} adventurers. One table. More arguments about loot than any dragon has ever caused.`
                : 'Gather your fellowship and let the adventure begin.'}
            </p>
          </div>

          {characters.length > 0 ? (
            <div className={styles.portraits} ref={gridRef}>
              {characters.map(c => (
                <a key={c.slug} className={styles.portrait} href={`/characters/${c.slug}`}>
                  <div className={styles.portraitImg}>
                    {c.portrait
                      ? <img src={c.portrait} alt={c.name} className={styles.portraitPhoto} />
                      : <i className={`fa-solid ${classIcon(c.characterClass)}`} />}
                  </div>
                  <div className={styles.portraitCaption}>
                    <p className={styles.portraitName}>{c.name}</p>
                    <p className={styles.portraitClass}>
                      {c.characterClass ?? 'Adventurer'}
                      {c.level ? ` · Lvl ${c.level}` : ''}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className={styles.fellowshipEmpty}>No active characters found for this campaign.</p>
          )}

          {nav.visible && (
            <div className={styles.portraitsNav}>
              <button aria-label="Previous" disabled={nav.atStart} onClick={() => scrollBy(-1)}>
                <i className="fa-solid fa-chevron-left" />
              </button>
              <button aria-label="Next" disabled={nav.atEnd} onClick={() => scrollBy(1)}>
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CHRONICLES ───────────────────────────────────────────────────── */}
      <section className={styles.chronicles} id="chronicles">
        <div className="wrap">
          <h2 className="section-label">Chronicles</h2>
          <div className={styles.chroniclesInner}>
            <div className={styles.chroniclesImage}>
              <img src={chroniclesImage} alt="Chronicles" className={styles.chroniclesPhoto} />
            </div>

            <ul className={styles.chroniclesList}>
              {recentSessions.length > 0 ? (
                recentSessions.map(s => (
                  <li key={s.slug}>
                    <a href={`/sessions/${s.slug}`} className={styles.chLink}>
                      <span className={styles.chNum}>Session {toRoman(s.sessionNumber)}</span>
                      <p className={styles.chTitle}>{stripSessionPrefix(s.title)}</p>
                      {s.summary && <p className={styles.chDesc}>{s.summary}</p>}
                      <p className={styles.chMeta}>
                        {fmtDate(s.date)}
                        {s.xp ? <>&nbsp;&middot;&nbsp;{s.xp} XP</> : ''}
                        {s.partyPresent?.length ? <>&nbsp;&middot;&nbsp;{s.partyPresent.length} present</> : ''}
                      </p>
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <span className={styles.chNum}>No sessions recorded yet</span>
                  <p className={styles.chDesc}>The chronicles are empty. Your story has yet to be written.</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* ── COMPENDIUM ───────────────────────────────────────────────────── */}
      <section className={styles.compendium} id="compendium">
        <div className="wrap">
          <h2 className="section-label">Compendium</h2>
          <div className={styles.compendiumInner}>
            <div>
              <p className={styles.compendiumTagline}>
                A living record of the world the party is unravelling.
              </p>
              <div className={styles.compendiumCounts}>
                <div className={styles.compCount}>
                  <p className={styles.n}>{compendiumCounts.npcs}</p>
                  <p className={styles.lbl}>NPCs</p>
                </div>
                <div className={styles.compCount}>
                  <p className={styles.n}>{compendiumCounts.factions}</p>
                  <p className={styles.lbl}>Factions</p>
                </div>
                <div className={styles.compCount}>
                  <p className={styles.n}>{compendiumCounts.items}</p>
                  <p className={styles.lbl}>Items &amp; Artifacts</p>
                </div>
              </div>
            </div>

            <div>
              <CompendiumEntry
                href="/lore#npcs"
                icon="fa-person-walking"
                title="NPCs"
                desc="Named figures of the realm — allies, enemies, and those whose allegiances have yet to be determined."
                count={compendiumCounts.npcs}
                unit={['entry', 'entries']}
              />
              <CompendiumEntry
                href="/lore#factions"
                icon="fa-flag"
                title="Factions"
                desc="Powers that shape the realm — guilds, orders, noble houses, and those who serve no master."
                count={compendiumCounts.factions}
                unit={['faction', 'factions']}
              />
              <CompendiumEntry
                href="/lore#items"
                icon="fa-gem"
                title="Items & Artifacts"
                desc="Relics found, traded, and buried. Some objects have histories longer than the kingdoms that forged them."
                count={compendiumCounts.items}
                unit={['entry', 'entries']}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

interface CompendiumEntryProps {
  href: string;
  icon: string;
  title: string;
  desc: string;
  count: number;
  unit: [singular: string, plural: string];
}

function CompendiumEntry({ href, icon, title, desc, count, unit }: CompendiumEntryProps) {
  return (
    <a className={styles.compEntry} href={href}>
      <div className={styles.compEntryIcon}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <p className={styles.compEntryTitle}>{title}</p>
        <p className={styles.compEntryDesc}>{desc}</p>
        <p className={styles.compEntryCount}>
          {count} {count === 1 ? unit[0] : unit[1]}
        </p>
      </div>
    </a>
  );
}
