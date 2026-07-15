import { create } from 'zustand';

export type SecretId = 'devConsole' | 'treasureChest' | 'miniGame' | 'crystalCollector';

export interface AchievementDef {
  id: SecretId;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
}

// One achievement per secret, plus 'crystalCollector' for the mini-game's
// own high-score milestone (not a "find a hidden thing" secret the same
// way the other three are, but reuses the same toast/unlock plumbing
// rather than inventing a second notification system for one entry).
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'devConsole',
    title: 'Behind the Curtain',
    titleBn: 'পর্দার আড়ালে',
    description: 'Opened the developer console.',
    descriptionBn: 'ডেভেলপার কনসোল খুলেছেন।',
    icon: '⌨️',
  },
  {
    id: 'treasureChest',
    title: 'Cave Explorer',
    titleBn: 'গুহা অভিযাত্রী',
    description: 'Found the treasure chest hidden deep in the cave.',
    descriptionBn: 'গুহার গভীরে লুকানো ধনসিন্দুক খুঁজে পেয়েছেন।',
    icon: '💎',
  },
  {
    id: 'miniGame',
    title: 'First Catch',
    titleBn: 'প্রথম ধরা',
    description: 'Played the crystal-catching mini-game.',
    descriptionBn: 'ক্রিস্টাল-ধরা মিনি-গেম খেলেছেন।',
    icon: '🎮',
  },
  {
    id: 'crystalCollector',
    title: 'Crystal Collector',
    titleBn: 'ক্রিস্টাল সংগ্রাহক',
    description: 'Scored 20+ in the mini-game.',
    descriptionBn: 'মিনি-গেমে ২০+ স্কোর করেছেন।',
    icon: '🏆',
  },
];

const STORAGE_KEY = 'crystalWorld.secrets.v1';

function loadFound(): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    // Corrupt/unavailable storage (private browsing, quota, bad JSON) —
    // treat as "nothing found yet" rather than crashing the whole site
    // over save-data that isn't essential to it working.
    return {};
  }
}

function persistFound(found: Record<string, true>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // Same reasoning as loadFound — losing persistence silently is fine,
    // the achievement still unlocks and toasts for this session either way.
  }
}

interface SecretsState {
  /** Every secret ever found, this session or a past one — hydrated from
   *  localStorage on first client read (see useHydrateSecrets below). */
  found: Record<string, true>;
  /** The most recently unlocked achievement, shown as a toast by
   *  AchievementToast, then cleared after its own display duration. */
  activeToast: AchievementDef | null;
  /** No-ops (and doesn't re-toast) if this id was already found in an
   *  earlier session — a returning visitor re-finding the chest shouldn't
   *  keep re-triggering the same celebration every time. */
  unlock: (id: SecretId) => void;
  clearToast: () => void;
  hydrate: () => void;
}

export const useSecretsStore = create<SecretsState>((set, get) => ({
  found: {},
  activeToast: null,

  unlock: (id) => {
    if (get().found[id]) return;
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    const nextFound = { ...get().found, [id]: true as const };
    persistFound(nextFound);
    set({ found: nextFound, activeToast: achievement ?? null });
  },

  clearToast: () => set({ activeToast: null }),

  // Deferred to an explicit call (from a small bootstrap component) rather
  // than read directly in the initializer above — avoids an SSR/hydration
  // mismatch, since the server has no localStorage to read from at all.
  hydrate: () => set({ found: loadFound() }),
}));
