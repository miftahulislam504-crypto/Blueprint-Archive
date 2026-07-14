'use client';

import { useState, FormEvent } from 'react';
import { Html } from '@react-three/drei';

const EMAIL = 'miftahulislam504@gmail.com';
const GITHUB_URL = 'https://github.com/miftahulislam504-crypto';

interface ContactIslandProps {
  position?: [number, number, number];
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  marginBottom: 8,
  borderRadius: 6,
  border: '1px solid rgba(92, 225, 255, 0.25)',
  background: 'rgba(255,255,255,0.04)',
  color: '#e8e6ff',
  fontSize: 13,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export function ContactIsland({ position = [0, 0, -26] }: ContactIslandProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // No form backend is wired up yet — this falls back to opening the
    // visitor's own mail client with everything pre-filled, so the form
    // is functional today. Swap the body of this function for a real POST
    // (a Firebase Function fits the stack already used elsewhere) whenever
    // that's set up; the fields/validation above don't need to change.
    const subject = encodeURIComponent(`Portfolio contact from ${name || 'a visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <Html position={position} transform occlude distanceFactor={4}>
      <div
        style={{
          width: 320,
          padding: 24,
          borderRadius: 16,
          background: 'rgba(20, 15, 45, 0.55)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(92, 225, 255, 0.35)',
          color: '#e8e6ff',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 0 40px rgba(75, 63, 158, 0.4)',
        }}
      >
        <h2 style={{ margin: '0 0 12px', color: '#5CE1FF', fontSize: 20 }}>
          Crystal Portal
        </h2>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, fontSize: 13 }}>
          <a href={`mailto:${EMAIL}`} style={{ color: '#5CE1FF' }}>
            Email
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#5CE1FF' }}
          >
            GitHub
          </a>
          {/* LinkedIn / Facebook / WhatsApp / Resume — no link on record,
              add your own href here when ready. */}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              background: '#4B3F9E',
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </Html>
  );
}
