export interface ProjectEntry {
  name: string;
  description: string;
  color: string;
}

// Real projects, pulled from what's actually been built — swap in your own
// summaries/links once each one has a public-facing writeup. Order here is
// just display order, not significance.
export const PROJECTS: ProjectEntry[] = [
  {
    name: 'CIVION',
    description: '3D portfolio built on a crystal-shard rendering architecture',
    color: '#4B3F9E',
  },
  {
    name: 'Crystal World',
    description: 'This site — an AAA-game-inspired 3D portfolio',
    color: '#5CE1FF',
  },
  {
    name: 'Chemistry Unfiltered',
    description: 'Bengali-language chemistry learning platform',
    color: '#7ef2a8',
  },
  {
    name: 'BrotherFit',
    description: 'E-commerce + WhatsApp admin panel with AI auto-reply',
    color: '#ff9ecb',
  },
  {
    name: 'EngineX Learn',
    description: 'Civil engineering learning platform',
    color: '#ffd166',
  },
  {
    name: 'CivilOS Structural',
    description: 'BNBC 2020 / ACI 318-19 compliant structural analysis tool',
    color: '#e0e0e0',
  },
];
