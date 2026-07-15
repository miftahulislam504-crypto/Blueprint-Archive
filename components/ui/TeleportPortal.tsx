'use client';

import { useState } from 'react';
import { useWorldStore } from '@/stores/useWorldStore';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { DESTINATIONS } from '@/lib/world/destinations';

/**
 * A floating "portal" trigger (bottom-right, clear of TouchJoystick which
 * lives bottom-left and HUD which is bottom-center) that expands into a
 * scrollable list of every destination. Tapping one calls requestTeleport
 * and closes the panel — TeleportController (inside the Canvas) does the
 * actual work of getting there.
 *
 * Kept as a plain list rather than a literal radial/circular layout: with
 * 9 destinations a circle either gets crowded or needs a much larger
 * diameter than comfortably fits a phone screen, and a scrollable list
 * reads just as "portal menu" while staying reliably tappable at any
 * screen size.
 */
export function TeleportPortal() {
  const [open, setOpen] = useState(false);
  const requestTeleport = useWorldStore((s) => s.requestTeleport);
  const isTeleporting = useWorldStore((s) => s.isTeleporting);
  const language = useWorldStore((s) => s.language);

  const handleToggle = () => {
    audioEngine.playClick();
    setOpen((v) => !v);
  };

  const handleSelect = (id: string) => {
    audioEngine.playToggleOn();
    requestTeleport(id);
    setOpen(false);
  };

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 100, zIndex: 40 }}>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            right: 0,
            width: 148,
            maxHeight: 260,
            overflowY: 'auto',
            borderRadius: 14,
            background: 'rgba(20, 15, 45, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(92, 225, 255, 0.25)',
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {DESTINATIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => handleSelect(d.id)}
              style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: '#e8e6ff',
                fontSize: 13,
                cursor: 'pointer',
              }}
              onTouchStart={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(92, 225, 255, 0.15)';
              }}
            >
              {language === 'bn' ? d.labelBn : d.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleToggle}
        aria-label="Teleport portal"
        title="Teleport"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid rgba(92, 225, 255, 0.35)',
          background: isTeleporting
            ? 'rgba(92, 225, 255, 0.35)'
            : open
            ? 'rgba(92, 225, 255, 0.25)'
            : 'rgba(20, 15, 45, 0.6)',
          color: '#e8e6ff',
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, transform 0.2s',
          transform: isTeleporting ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        🌀
      </button>
    </div>
  );
}
