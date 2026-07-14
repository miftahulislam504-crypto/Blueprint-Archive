'use client';

import { useEffect, useRef } from 'react';
import { useWorldStore } from '@/stores/useWorldStore';

const AMBIENT_TRACK_PATH = '/audio/ambient.mp3';

/**
 * Ties the existing musicEnabled toggle (HUD's speaker button — already
 * wired to the store, it just never had anything listening to it) to
 * actual playback. No audio file exists in this project yet — this plays
 * /audio/ambient.mp3 once one's added there; until then it fails to load
 * silently rather than throwing, so nothing breaks in the meantime.
 *
 * preload="none" rather than "auto"/"metadata": with no file there yet,
 * eager preloading would just trigger a 404 on every single page load
 * regardless of whether music ever gets toggled on. This way the browser
 * only attempts the fetch once play() is actually called.
 *
 * Renders no visible output — the <audio> element is just a ref target,
 * kept in the DOM anyway (rather than built purely in JS) so it's easy to
 * find in a mobile devtools console like Eruda.
 */
export function AudioManager() {
  const musicEnabled = useWorldStore((s) => s.musicEnabled);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicEnabled) {
      // play() returns a promise that rejects if the browser's autoplay
      // policy blocks it, or if the file 404s/fails to decode — both real
      // possibilities right now given there's no file yet. Either way, a
      // silent no-op is the right failure mode here, not a thrown error.
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [musicEnabled]);

  return (
    <audio
      ref={audioRef}
      src={AMBIENT_TRACK_PATH}
      loop
      preload="none"
      onError={() => {
        // Expected until an actual file exists at AMBIENT_TRACK_PATH —
        // logged at a low level rather than surfaced as an error, since
        // this isn't a bug in this component.
        console.info(`AudioManager: no ambient track found at ${AMBIENT_TRACK_PATH} yet`);
      }}
      style={{ display: 'none' }}
    />
  );
}
