'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const CRITTERS = [
  { id: 'cat',   emoji: '🐱', name: 'Cat',   color: '#FFD6E0', border: '#FF8FAB', fun: 'Cat purrs! 😻',    pts: 10 },
  { id: 'tree',  emoji: '🌳', name: 'Tree',  color: '#D6F5D6', border: '#5CB85C', fun: 'Tree grows! 🌱',   pts: 15 },
  { id: 'nacho', emoji: '🧀', name: 'Nacho', color: '#FFF3CD', border: '#FFC107', fun: 'Extra cheesy! 🎉', pts: 20 },
];

type Critter = typeof CRITTERS[0];

interface Tile {
  id: number;
  critter: Critter;
  left: number;
  top: number;
  popped: boolean;
}

let _uid = 1;

export default function SmileCritters() {
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(3);
  const [tiles, setTiles]     = useState<Tile[]>([]);
  const [toast, setToast]     = useState('');
  const [started, setStarted] = useState(false);
  const [over, setOver]       = useState(false);
  const [speed, setSpeed]     = useState(2800);
  const toastTimer            = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1100);
  };

  useEffect(() => {
    if (!started || over) return;
    const t = setInterval(() => {
      const c = CRITTERS[Math.floor(Math.random() * 3)];
      const id = _uid++;
      setTiles(prev => [...prev, { id, critter: c, left: 5 + Math.random() * 82, top: -8, popped: false }]);
    }, speed);
    return () => clearInterval(t);
  }, [started, over, speed]);

  useEffect(() => {
    if (!started || over) return;
    const f = setInterval(() => {
      setTiles(prev => prev.map(t => t.popped ? t : { ...t, top: t.top + 1.8 }));
    }, 60);
    return () => clearInterval(f);
  }, [started, over]);

  useEffect(() => {
    if (!started || over) return;
    const missed = tiles.filter(t => !t.popped && t.top > 102);
    if (missed.length === 0) return;
    setTiles(prev => prev.filter(t => t.popped || t.top <= 102));
    setLives(l => {
      const next = l - missed.length;
      if (next <= 0) { setOver(true); return 0; }
      return next;
    });
    showToast('😢 Missed!');
  }, [tiles, started, over]);

  useEffect(() => {
    if (!started || over) return;
    const t = setTimeout(() => setSpeed(s => Math.max(500, s - 250)), 6000);
    return () => clearTimeout(t);
  }, [speed, started, over]);

  const catch_ = useCallback((id: number, critter: Critter) => {
    setTiles(prev => prev.map(t => t.id === id ? { ...t, popped: true } : t));
    setScore(s => s + critter.pts);
    showToast(`😄 +${critter.pts} — ${critter.fun}`);
    setTimeout(() => setTiles(prev => prev.filter(t => t.id !== id)), 350);
  }, []);

  const restart = () => {
    _uid = 1;
    setScore(0); setLives(3); setTiles([]); setOver(false);
    setSpeed(2800); setStarted(true); setToast('');
  };

  const hearts = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Segoe UI',sans-serif", userSelect: 'none' }}>
      <div style={{ textAlign: 'center', padding: '22px 0 6px', color: '#fff' }}>
        <h1 style={{ fontSize: 46, margin: 0, fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,.35)' }}>😊 Smile Critters</h1>
        <p style={{ fontSize: 17, margin: '4px 0 0', opacity: .85 }}>Cat 🐱 · Tree 🌳 · Nacho 🧀</p>
      </div>
      {started && (
        <div style={{ display: 'flex', gap: 32, color: '#fff', fontSize: 22, fontWeight: 700, margin: '4px 0' }}>
          <span>⭐ {score}</span>
          <span>{hearts}</span>
        </div>
      )}
      {toast && (
        <div style={{ background: 'rgba(255,255,255,.95)', borderRadius: 20, padding: '7px 22px', fontSize: 19, fontWeight: 700, color: '#333', boxShadow: '0 4px 16px rgba(0,0,0,.22)', marginBottom: 4 }}>
          {toast}
        </div>
      )}
      {started && !over && (
        <div style={{ position: 'relative', width: '92vw', maxWidth: 580, height: '54vh', background: 'rgba(255,255,255,.12)', borderRadius: 22, overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)', marginTop: 4 }}>
          {tiles.map(t => (
            <div
              key={t.id}
              onClick={() => !t.popped && catch_(t.id, t.critter)}
              style={{
                position: 'absolute',
                left: `${t.left}%`,
                top: `${t.top}%`,
                fontSize: 50,
                transform: t.popped ? 'translate(-50%,-50%) scale(1.9)' : 'translate(-50%,-50%) scale(1)',
                opacity: t.popped ? 0 : 1,
                transition: t.popped ? 'transform .3s, opacity .3s' : undefined,
                cursor: 'pointer',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.4))',
              }}
            >
              {t.critter.emoji}
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: 6, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,.45)', fontSize: 13 }}>Tap a critter to catch it!</div>
        </div>
      )}
      {!started && !over && (
        <div style={{ textAlign: 'center', color: '#fff', marginTop: 18 }}>
          <div style={{ fontSize: 66, marginBottom: 6 }}>🐱🌳🧀</div>
          <p style={{ fontSize: 17, opacity: .9, marginBottom: 20 }}>Catch critters before they fall!<br /><strong>Cat</strong> = 10 pts · <strong>Tree</strong> = 15 pts · <strong>Nacho</strong> = 20 pts</p>
          <button onClick={() => setStarted(true)} style={{ background: '#fff', color: '#764ba2', border: 'none', borderRadius: 50, padding: '13px 46px', fontSize: 22, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,.28)' }}>▶ Play!</button>
        </div>
      )}
      {over && (
        <div style={{ textAlign: 'center', color: '#fff', marginTop: 24 }}>
          <div style={{ fontSize: 60 }}>😢</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, margin: '8px 0' }}>Game Over!</h2>
          <p style={{ fontSize: 22 }}>Score: <strong>⭐ {score}</strong></p>
          <p style={{ fontSize: 15, opacity: .8 }}>{score >= 100 ? '🏆 Nacho champion!' : score >= 50 ? '🌟 Cat approves!' : '🐱 Keep smiling!'}</p>
          <button onClick={restart} style={{ background: '#fff', color: '#764ba2', border: 'none', borderRadius: 50, padding: '13px 46px', fontSize: 22, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,.28)', marginTop: 14 }}>🔄 Play Again</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, marginTop: 22, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 24 }}>
        {CRITTERS.map(c => (
          <div key={c.id} style={{ background: c.color, border: `2px solid ${c.border}`, borderRadius: 16, padding: '10px 18px', textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: 38 }}>{c.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: '#555' }}>+{c.pts} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
