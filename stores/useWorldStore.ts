import { create } from 'zustand';

export type QualityTier = 'low' | 'mid' | 'high';
export type CameraMode = 'scroll' | 'orbit' | 'explore';
export type Theme = 'dark' | 'light';
export type Language = 'en' | 'bn';
export type WeatherCondition = 'clear' | 'crystalRain' | 'mistVeil';

interface WorldState {
  qualityTier: QualityTier;
  qualityDetected: boolean;
  setQualityTier: (tier: QualityTier) => void;

  /** 0 to 1, driven by Lenis every frame. Read by CameraRig, not written by it. */
  scrollProgress: number;
  setScrollProgress: (p: number) => void;

  /** 'scroll' = camera locked to the journey path. 'orbit' = free look
   *  via drei's OrbitControls. 'explore' = third-person follow behind a
   *  player-controlled PlayerAvatar (see components/world/PlayerAvatar
   *  and CameraRig's own 'explore' branch). */
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;

  /** 'dark' matches the aurora/space aesthetic everything's been built
   *  against so far — 'light' is wired as a toggle but doesn't have its
   *  own palette defined yet. */
  theme: Theme;
  setTheme: (t: Theme) => void;

  language: Language;
  setLanguage: (l: Language) => void;

  musicEnabled: boolean;
  toggleMusic: () => void;

  /** Shows drei's <Stats /> FPS/ms overlay when true. */
  showStats: boolean;
  toggleStats: () => void;

  /** The *target* condition — WeatherSystem auto-cycles this over time.
   *  The actual visual crossfade between conditions is handled outside
   *  the store entirely, by weatherIntensity (see lib/weather) — putting
   *  a smoothly-animating per-frame value here would mean every
   *  subscriber re-rendering 60 times a second, which this avoids. */
  weatherCondition: WeatherCondition;
  setWeatherCondition: (condition: WeatherCondition) => void;

  /** On by default — low cost, and most useful exactly when someone
   *  might not think to look for a toggle yet (first time in explore
   *  mode, unsure where things are). */
  showMiniMap: boolean;
  toggleMiniMap: () => void;
}

// 'mid' is the default until client-side detection runs once on mount —
// this also avoids an SSR/hydration mismatch, since 'low' or 'high'
// guessed on the server could flash-swap visibly on first paint.
export const useWorldStore = create<WorldState>((set) => ({
  qualityTier: 'mid',
  qualityDetected: false,
  setQualityTier: (tier) => set({ qualityTier: tier, qualityDetected: true }),

  scrollProgress: 0,
  setScrollProgress: (p) => set({ scrollProgress: p }),

  cameraMode: 'scroll',
  setCameraMode: (mode) => set({ cameraMode: mode }),

  theme: 'dark',
  setTheme: (t) => set({ theme: t }),

  language: 'en',
  setLanguage: (l) => set({ language: l }),

  musicEnabled: false,
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

  showStats: false,
  toggleStats: () => set((s) => ({ showStats: !s.showStats })),

  weatherCondition: 'clear',
  setWeatherCondition: (condition) => set({ weatherCondition: condition }),

  showMiniMap: true,
  toggleMiniMap: () => set((s) => ({ showMiniMap: !s.showMiniMap })),
}));
