'use client';

import { useWorldStore } from '@/stores/useWorldStore';
import { audioEngine } from '@/lib/audio/AudioEngine';

const buttonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: '1px solid rgba(92, 225, 255, 0.3)',
  background: 'rgba(20, 15, 45, 0.6)',
  color: '#e8e6ff',
  fontSize: 15,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function HUD() {
  const theme = useWorldStore((s) => s.theme);
  const setTheme = useWorldStore((s) => s.setTheme);
  const language = useWorldStore((s) => s.language);
  const setLanguage = useWorldStore((s) => s.setLanguage);
  const musicEnabled = useWorldStore((s) => s.musicEnabled);
  const toggleMusic = useWorldStore((s) => s.toggleMusic);
  const showStats = useWorldStore((s) => s.showStats);
  const toggleStats = useWorldStore((s) => s.toggleStats);
  const cameraMode = useWorldStore((s) => s.cameraMode);
  const setCameraMode = useWorldStore((s) => s.setCameraMode);
  const showMiniMap = useWorldStore((s) => s.showMiniMap);
  const toggleMiniMap = useWorldStore((s) => s.toggleMiniMap);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 10,
        padding: 10,
        borderRadius: 999,
        background: 'rgba(20, 15, 45, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(92, 225, 255, 0.2)',
        zIndex: 10,
      }}
    >
      <button
        style={buttonStyle}
        onClick={() => {
          audioEngine.playClick();
          setTheme(theme === 'dark' ? 'light' : 'dark');
        }}
        aria-label="Toggle theme"
        title="Theme"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>

      <button
        style={buttonStyle}
        onClick={() => {
          audioEngine.playClick();
          setLanguage(language === 'en' ? 'bn' : 'en');
        }}
        aria-label="Toggle language"
        title="Language"
      >
        {language === 'en' ? 'EN' : 'বাং'}
      </button>

      <button
        style={buttonStyle}
        onClick={() => {
          audioEngine[musicEnabled ? 'playToggleOff' : 'playToggleOn']();
          toggleMusic();
        }}
        aria-label="Toggle music"
        title="Music"
      >
        {musicEnabled ? '🔊' : '🔇'}
      </button>

      <button
        style={buttonStyle}
        onClick={() => {
          const nextMode = cameraMode === 'explore' ? 'scroll' : 'explore';
          audioEngine[nextMode === 'explore' ? 'playToggleOn' : 'playToggleOff']();
          setCameraMode(nextMode);
        }}
        aria-label="Toggle walk mode"
        title="Walk mode"
      >
        {cameraMode === 'explore' ? '🖱️' : '🚶'}
      </button>

      <button
        style={buttonStyle}
        onClick={() => {
          audioEngine[showMiniMap ? 'playToggleOff' : 'playToggleOn']();
          toggleMiniMap();
        }}
        aria-label="Toggle mini map"
        title="Mini map"
      >
        🗺️
      </button>

      <button
        style={buttonStyle}
        onClick={() => {
          audioEngine[showStats ? 'playToggleOff' : 'playToggleOn']();
          toggleStats();
        }}
        aria-label="Toggle performance stats"
        title="FPS monitor"
      >
        📊
      </button>
    </div>
  );
}
