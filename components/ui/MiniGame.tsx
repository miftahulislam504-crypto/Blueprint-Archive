'use client';

import { useEffect, useRef, useState } from 'react';
import { useSecretsStore } from '@/stores/useSecretsStore';
import { audioEngine } from '@/lib/audio/AudioEngine';

interface MiniGameProps {
  onClose: () => void;
}

const GAME_DURATION_S = 30;
const PADDLE_WIDTH = 70;
const PADDLE_HEIGHT = 10;
const CRYSTAL_SIZE = 14;
const HIGH_SCORE_THRESHOLD = 20;
const HIGH_SCORE_KEY = 'crystalWorld.miniGame.highScore';

interface FallingCrystal {
  x: number;
  y: number;
  speed: number;
  caught: boolean;
  missed: boolean;
}

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(window.localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Non-essential — losing a high-score save silently is fine.
  }
}

/**
 * Plain 2D canvas, not a Three.js/R3F scene — this is a DOM overlay
 * sibling to WorldCanvas, not content inside it, so a lightweight
 * <canvas> with a manual requestAnimationFrame loop is far simpler here
 * than routing a whole second r3f Canvas through the same tree. Catch
 * falling crystals with a paddle that follows pointer/touch drag,
 * matching the same Pointer Events approach TouchJoystick already uses
 * so it works identically with mouse or touch.
 */
export function MiniGame({ onClose }: MiniGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paddleXRef = useRef(0.5); // 0 to 1, fraction of canvas width
  const crystalsRef = useRef<FallingCrystal[]>([]);
  const scoreRef = useRef(0);
  const spawnAccumRef = useRef(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [phase, setPhase] = useState<'playing' | 'ended'>('playing');
  const [highScore, setHighScore] = useState(0);
  const unlock = useSecretsStore((s) => s.unlock);

  useEffect(() => {
    setHighScore(loadHighScore());
    unlock('miniGame');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setPhase('ended');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'ended') {
      audioEngine.playTone({ frequency: 520, duration: 0.3, type: 'sine', volume: 0.15 });
      const finalScore = scoreRef.current;
      const prevHigh = loadHighScore();
      if (finalScore > prevHigh) {
        saveHighScore(finalScore);
        setHighScore(finalScore);
      }
      if (finalScore >= HIGH_SCORE_THRESHOLD) {
        unlock('crystalCollector');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'playing') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let lastTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const w = canvas.width;
      const h = canvas.height;
      const dpr = window.devicePixelRatio;

      // Spawn new crystals on a roughly-steady cadence.
      spawnAccumRef.current += delta;
      const spawnInterval = 0.75;
      if (spawnAccumRef.current > spawnInterval) {
        spawnAccumRef.current = 0;
        crystalsRef.current.push({
          x: Math.random() * w,
          y: -CRYSTAL_SIZE * dpr,
          speed: (120 + Math.random() * 90) * dpr,
          caught: false,
          missed: false,
        });
      }

      const paddleY = h - 30 * dpr;
      const paddleXPx = paddleXRef.current * w;
      const paddleHalf = (PADDLE_WIDTH * dpr) / 2;

      crystalsRef.current.forEach((c) => {
        if (c.caught || c.missed) return;
        c.y += c.speed * delta;

        if (
          c.y + CRYSTAL_SIZE * dpr >= paddleY &&
          c.y <= paddleY + PADDLE_HEIGHT * dpr &&
          c.x >= paddleXPx - paddleHalf &&
          c.x <= paddleXPx + paddleHalf
        ) {
          c.caught = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          audioEngine.playTone({ frequency: 880, duration: 0.1, type: 'sine', volume: 0.12 });
        } else if (c.y > h) {
          c.missed = true;
        }
      });
      crystalsRef.current = crystalsRef.current.filter((c) => !c.caught && !c.missed);

      // Clear + background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(5, 3, 15, 0.55)';
      ctx.fillRect(0, 0, w, h);

      // Crystals — simple rotated-square diamonds, matching the world's
      // faceted/crystal visual language without needing an actual sprite.
      ctx.fillStyle = '#5CE1FF';
      ctx.shadowColor = '#5CE1FF';
      ctx.shadowBlur = 8 * dpr;
      crystalsRef.current.forEach((c) => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(Math.PI / 4);
        const s = CRYSTAL_SIZE * dpr;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      });
      ctx.shadowBlur = 0;

      // Paddle
      ctx.fillStyle = '#e8e6ff';
      ctx.fillRect(paddleXPx - paddleHalf, paddleY, paddleHalf * 2, PADDLE_HEIGHT * dpr);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [phase]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    paddleXRef.current = Math.min(Math.max(fraction, 0), 1);
  };

  const handleReplay = () => {
    crystalsRef.current = [];
    scoreRef.current = 0;
    spawnAccumRef.current = 0;
    setScore(0);
    setTimeLeft(GAME_DURATION_S);
    setPhase('playing');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(3, 2, 10, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'sans-serif',
        color: '#e8e6ff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 420,
          marginBottom: 10,
          fontSize: 13,
        }}
      >
        <span>Score: {score}</span>
        <span>High: {highScore}</span>
        <span>Time: {timeLeft}s</span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#e8e6ff', fontSize: 16, cursor: 'pointer' }}
          aria-label="Close mini-game"
        >
          ×
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          height: 420,
          maxHeight: '60vh',
          borderRadius: 12,
          border: '1px solid rgba(92, 225, 255, 0.3)',
          overflow: 'hidden',
          touchAction: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {phase === 'ended' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              background: 'rgba(5, 3, 15, 0.75)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>Time&apos;s up!</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              You caught {score} crystal{score === 1 ? '' : 's'}
            </div>
            {score >= HIGH_SCORE_THRESHOLD && (
              <div style={{ fontSize: 12, color: '#7ef2a8' }}>🏆 Crystal Collector unlocked!</div>
            )}
            <button
              onClick={handleReplay}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                border: '1px solid rgba(92, 225, 255, 0.4)',
                background: 'rgba(92, 225, 255, 0.15)',
                color: '#e8e6ff',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Play again
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, opacity: 0.55, marginTop: 10 }}>
        Drag left/right to move the paddle · catch {HIGH_SCORE_THRESHOLD}+ for a bonus achievement
      </p>
    </div>
  );
}
