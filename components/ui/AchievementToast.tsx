'use client';

import { useEffect, useState } from 'react';
import { useSecretsStore } from '@/stores/useSecretsStore';
import { useWorldStore } from '@/stores/useWorldStore';
import { audioEngine } from '@/lib/audio/AudioEngine';

const DISPLAY_MS = 4200;
const ENTER_MS = 400;

/**
 * Watches activeToast in useSecretsStore — any of the four unlock() call
 * sites (Dev Console, Treasure Chest, mini-game start, mini-game
 * high-score) triggers this the same way, so there's exactly one toast
 * implementation for all of Hidden Secrets rather than four bespoke ones.
 *
 * Two-phase visibility (mounted vs visible) rather than a single boolean:
 * mounting and immediately setting the "visible" (transitioned-in) class
 * in the same tick would collapse the CSS transition to nothing, since
 * the browser never gets a paint at the pre-transition state in between.
 */
export function AchievementToast() {
  const achievement = useSecretsStore((s) => s.activeToast);
  const clearToast = useSecretsStore((s) => s.clearToast);
  const language = useWorldStore((s) => s.language);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;

    audioEngine.playTone({ frequency: 660, duration: 0.15, type: 'sine', volume: 0.15 });
    window.setTimeout(() => {
      audioEngine.playTone({ frequency: 990, duration: 0.25, type: 'sine', volume: 0.13 });
    }, 130);

    const enterTimer = window.setTimeout(() => setVisible(true), 20);
    const exitTimer = window.setTimeout(() => setVisible(false), DISPLAY_MS);
    const clearTimer = window.setTimeout(() => clearToast(), DISPLAY_MS + ENTER_MS);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(clearTimer);
      setVisible(false);
    };
  }, [achievement, clearToast]);

  if (!achievement) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 18px',
        borderRadius: 14,
        background: 'rgba(20, 15, 45, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(92, 225, 255, 0.4)',
        boxShadow: '0 0 24px rgba(92, 225, 255, 0.25)',
        color: '#e8e6ff',
        fontFamily: 'sans-serif',
        maxWidth: 300,
        transform: `translate(-50%, ${visible ? '0' : '-24px'})`,
        opacity: visible ? 1 : 0,
        transition: `transform ${ENTER_MS}ms ease, opacity ${ENTER_MS}ms ease`,
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 26, lineHeight: 1 }}>{achievement.icon}</div>
      <div>
        <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.6, marginBottom: 2 }}>
          {language === 'bn' ? 'অর্জন আনলক' : 'ACHIEVEMENT UNLOCKED'}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          {language === 'bn' ? achievement.titleBn : achievement.title}
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
          {language === 'bn' ? achievement.descriptionBn : achievement.description}
        </div>
      </div>
    </div>
  );
}
