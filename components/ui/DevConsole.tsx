'use client';

import { useEffect, useRef, useState } from 'react';
import { useWorldStore } from '@/stores/useWorldStore';
import { useSecretsStore, ACHIEVEMENTS } from '@/stores/useSecretsStore';
import { detectQualityTier } from '@/lib/detectQualityTier';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { prefetchAvatarNow } from '@/components/world/AvatarPrefetch';

interface DevConsoleProps {
  onClose: () => void;
  onLaunchGame: () => void;
}

interface LogLine {
  text: string;
  tone: 'input' | 'output' | 'system';
}

const BANNER = [
  '  CRYSTAL WORLD — DEV CONSOLE',
  '  type "help" for a list of commands',
];

/**
 * A real (if tiny) command interpreter rather than a fixed set of buttons
 * — feels more like an actual console, which is the point of finding one.
 * State/behavior commands (theme, teleport, etc.) all go through
 * useWorldStore's existing actions, the same ones HUD's buttons call, so
 * this never duplicates logic HUD already owns — it's just another way
 * to trigger it.
 */
export function DevConsole({ onClose, onLaunchGame }: DevConsoleProps) {
  const [lines, setLines] = useState<LogLine[]>(
    BANNER.map((text) => ({ text, tone: 'system' as const }))
  );
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const found = useSecretsStore((s) => s.found);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const print = (text: string, tone: LogLine['tone'] = 'output') => {
    setLines((prev) => [...prev, { text, tone }]);
  };

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    print(`> ${trimmed}`, 'input');

    const [cmd, ...args] = trimmed.toLowerCase().split(/\s+/);
    const store = useWorldStore.getState();

    switch (cmd) {
      case 'help':
        print('commands: help, tier, theme <dark|light>, weather <clear|rain|mist>,');
        print('          mode <scroll|orbit|explore>, achievements, play, clear, exit');
        break;

      case 'tier':
        print(`current quality tier: ${store.qualityTier}`);
        print(`re-detected right now: ${detectQualityTier()}`);
        break;

      case 'theme':
        if (args[0] === 'dark' || args[0] === 'light') {
          store.setTheme(args[0]);
          print(`theme set to ${args[0]}`);
        } else {
          print('usage: theme <dark|light>');
        }
        break;

      case 'weather': {
        const map = { clear: 'clear', rain: 'crystalRain', mist: 'mistVeil' } as const;
        const key = args[0] as keyof typeof map;
        if (map[key]) {
          store.setWeatherCondition(map[key]);
          print(`weather set to ${map[key]}`);
        } else {
          print('usage: weather <clear|rain|mist>');
        }
        break;
      }

      case 'mode':
        if (args[0] === 'scroll' || args[0] === 'orbit' || args[0] === 'explore') {
          if (args[0] === 'explore') prefetchAvatarNow();
          store.setCameraMode(args[0]);
          print(`camera mode set to ${args[0]}`);
        } else {
          print('usage: mode <scroll|orbit|explore>');
        }
        break;

      case 'achievements': {
        const total = ACHIEVEMENTS.length;
        const unlocked = ACHIEVEMENTS.filter((a) => found[a.id]).length;
        print(`${unlocked}/${total} unlocked:`);
        ACHIEVEMENTS.forEach((a) => {
          print(`  ${found[a.id] ? '[x]' : '[ ]'} ${a.icon} ${a.title}`);
        });
        break;
      }

      case 'play':
        print('launching crystal collector...');
        onLaunchGame();
        break;

      case 'clear':
        setLines([]);
        return;

      case 'exit':
        onClose();
        return;

      default:
        print(`unknown command: "${cmd}" — type "help"`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.playClick();
    runCommand(input);
    setInput('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(3, 2, 10, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#05030f',
          border: '1px solid rgba(92, 225, 255, 0.4)',
          borderRadius: 12,
          boxShadow: '0 0 32px rgba(92, 225, 255, 0.15)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(92, 225, 255, 0.2)',
            color: '#5CE1FF',
          }}
        >
          <span>dev@crystal-world</span>
          <button
            onClick={onClose}
            aria-label="Close console"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e8e6ff',
              fontSize: 16,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.tone === 'input' ? '#e8e6ff' : line.tone === 'system' ? '#7ef2a8' : '#a9a6d8',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {line.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderTop: '1px solid rgba(92, 225, 255, 0.2)',
          }}
        >
          <span style={{ color: '#5CE1FF' }}>{'>'}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e8e6ff',
              fontFamily: 'inherit',
              fontSize: 12,
            }}
          />
        </form>
      </div>
    </div>
  );
}
