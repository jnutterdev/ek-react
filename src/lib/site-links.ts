export interface SiteLink {
  href: string;
  label: string;
}

export const SITE_LINKS: SiteLink[] = [
  { href: '/', label: 'Campaign' },
  { href: '/characters', label: 'Fellowship' },
  { href: '/sessions', label: 'Chronicles' },
  { href: '/lore', label: 'Compendium' },
  { href: '/gamemasters', label: 'Gamemasters' },
  { href: '/about', label: 'About' },
];

export const DISCORD_URL = 'https://discord.gg/dTRaBUNY';
