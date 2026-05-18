'use client';
import { useState, useEffect, useCallback } from 'react';

const CRITTERS = [
  { id: 'cat',      emoji: '🐱', name: 'Cat',      color: '#ff6b9d', power: 'Purrfect Dodge',   bg: '#2d1b33', desc: 'Quick & sneaky!' },
  { id: 'nacho',    emoji: '🌮', name: 'Nacho',    color: '#ffa94d', power: 'Spicy Burst',      bg: '#2d2010', desc: 'Extra spicy!' },
  { id: 'dogday',   emoji: '🐶', name: 'Dogday',   color: '#f9c74f', power: 'Good Boy Fetch',   bg: '#2d2700', desc: 'Fetches double stars!' },
  { id: 'crafcone', emoji: '🍦', name: 'Crafcone', color: '#a0c4ff', power: 'Frosty Freeze',    bg: '#0d1b2a', desc: 'Freezes the clock!' },
  { id: 'hoophop',  emoji: '🐸', name: 'Hoophop',  color: '#80ffad', power: 'Leap Splash',      bg: '#0a2e1a', desc: 'Jumbo leap combo!' },
  { id: 'skoch',    emoji: '🐾', name: 'Skoch',    color: '#d0a0ff', power: 'Shadow Dash',      bg: '#1a0d2e', desc: 'Dashes through stars!' },
];

type Critter = typeof CRITTERS[0];
interface Star { id: number; x: number; y: number; caught: boolean; critter: Critter; }

export default function SmileCritters() {
  const [selected, setSelected] = useState<Critter | null>(null);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState<Star[]>([]);
  const [gameOn, setGameOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const [powerActive, setPowerActive] = useState(false);
  const [powerMsg, setPowerMsg] = useState('');
  const [combo, setCombo] = useState(0);
  const [frozen, setFrozen] = useState(false);

  const spawnStar = useCallback((critter: Critter) => {
    const count = critter.id === 'dogday' ? 2 : 1;
    const newStars: Star[] = Array.from({ length: count }, () => ({
      id: Date.now() + Math.random(),
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
      caught: false,
      critter,
    }));
    setStars(prev => [...prev.slice(-14), ...newStars]);
  }, []);

  useEffect(() => {
    if (!gameOn || !selected) return;
    const interval = setInterval(() => spawnStar(selected), 900);
    return () => clearInterval(interval);
  }, [gameOn, selected, spawnStar]);

  useEffect(() => {
    if (!gameOn || frozen) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOn(false);
          clearInterval(timer);
          setHighScore(prev => Math.max(prev, score));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOn, score, frozen]);

  const catchStar = (id: number) => {
    setStars(prev => prev.filter(s => s.id !== id));
    const newCombo = combo + 1;
    setCombo(newCombo);
    let pts = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
    if (selected?.id === 'hoophop' && newCombo >= 3) pts += 1;
    setScore(s => s + pts);
  };

  const activatePower = () => {
    if (!selected || powerActive) return;
    setPowerActive(true);

    if (selected.id === 'cat') {
      setPowerMsg('Purrfect Dodge! Stars cleared! +5 ⭐');
      setScore(s => s + 5);
      setStars([]);
    } else if (selected.id === 'nacho') {
      setPowerMsg('Spicy Burst! All stars caught! +8 ⭐');
      setScore(s => s + 8);
      setStars([]);
    } else if (selected.id === 'dogday') {
      setPowerMsg('Good Boy Fetch! Double spawn next 5s! +5 ⭐');
      setScore(s => s + 5);
    } else if (selected.id === 'crafcone') {
      setPowerMsg('Frosty Freeze! Clock frozen for 5s! ❄️');
      setFrozen(true);
      setTimeout(() => setFrozen(false), 5000);
    } else if (selected.id === 'hoophop') {
      setPowerMsg('Leap Splash! Combo multiplier doubled! +6 ⭐');
      setScore(s => s + 6);
      setCombo(c => c + 3);
    } else if (selected.id === 'skoch') {
      setPowerMsg('Shadow Dash! All stars auto-caught! +10 ⭐');
      const count = stars.length;
      setScore(s => s + 10 + count);
      setStars([]);
    }

    setTimeout(() => { setPowerActive(false); setPowerMsg(''); }, 2000);
  };

  const startGame = (c: Critter) => {
    setSelected(c);
    setScore(0);
    setStars([]);
    setTimeLeft(30);
    setCombo(0);
    setFrozen(false);
    setGameOn(true);
  };

  const reset = () => { setGameOn(false); setSelected(null); setScore(0); setStars([]); setTimeLeft(30); setCombo(0); setFrozen(false); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,6vw,4rem)', margin: '0 0 4px', textAlign: 'center', textShadow: '0 0 30px #7c5cbf' }}>😄 Smile Critters</h1>
      <p style={{ color: '#aaa', marginBottom: 24, fontSize: 14 }}>Pick your critter. Catch the stars. Beat the clock!</p>

      {!gameOn && !selected && (
        <div style={{ width: '100%', maxWidth: 700 }}>
          <p style={{ color: '#ccc', textAlign: 'center', marginBottom: 20, fontSize: 18 }}>Choose your critter:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, justifyItems: 'center' }}>
            {CRITTERS.map(c => (
              <button key={c.id} onClick={() => startGame(c)}
                style={{ background: c.bg, border: `3px solid ${c.color}`, borderRadius: 20, padding: '18px 16px', cursor: 'pointer', color: '#fff', textAlign: 'center', width: '100%', transition: 'transform .15s, box-shadow .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = `0 0 18px ${c.color}88`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 48 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, color: c.color, fontSize: 18, marginTop: 4 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#ccc', marginTop: 3 }}>{c.desc}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 4, fontStyle: 'italic' }}>{c.power}</div>
              </button>
            ))}
          </div>
          {highScore > 0 && <p style={{ color: '#ffd700', textAlign: 'center', marginTop: 20, fontSize: 16 }}>🏆 Best Score: {highScore}</p>}
        </div>
      )}

      {gameOn && selected && (
        <div style={{ width: '100%', maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: '#fff', fontSize: 18, fontWeight: 700 }}>
            <span style={{ color: selected.color }}>{selected.emoji} {selected.name}</span>
            <span>⭐ {score}</span>
            <span style={{ color: frozen ? '#a0c4ff' : timeLeft <= 5 ? '#ff6b6b' : '#fff' }}>{frozen ? '❄️ FROZEN' : `⏱ ${timeLeft}s`}</span>
          </div>
          {combo >= 3 && <div style={{ color: '#ffd700', textAlign: 'center', fontSize: 13, marginBottom: 6 }}>🔥 {combo}x Combo! +{combo >= 5 ? 3 : 2} per catch</div>}
          {powerMsg && <div style={{ color: selected.color, textAlign: 'center', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{powerMsg}</div>}
          <div style={{ position: 'relative', width: '100%', height: 320, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: `2px solid ${selected.color}44`, overflow: 'hidden' }}>
            {stars.map(s => (
              <button key={s.id} onClick={() => catchStar(s.id)}
                style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, transform: 'translate(-50%,-50%)', animation: 'pulse 0.8s infinite' }}
              >⭐</button>
            ))}
            {stars.length === 0 && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#555', fontSize: 14 }}>Stars incoming…</div>}
          </div>
          <button onClick={activatePower} disabled={powerActive}
            style={{ marginTop: 12, width: '100%', padding: '12px', background: powerActive ? '#333' : selected.color, color: powerActive ? '#555' : '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: powerActive ? 'not-allowed' : 'pointer' }}>
            ⚡ {selected.power} (use once!)
          </button>
          <button onClick={reset} style={{ marginTop: 8, width: '100%', padding: '8px', background: 'transparent', color: '#888', border: '1px solid #555', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>↩ Change Critter</button>
        </div>
      )}

      {!gameOn && selected && timeLeft === 0 && (
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 64 }}>{selected.emoji}</div>
          <h2 style={{ color: selected.color, fontSize: 32 }}>Game Over!</h2>
          <p style={{ fontSize: 24 }}>Score: <b style={{ color: '#ffd700' }}>{score}</b></p>
          {score >= highScore && score > 0 && <p style={{ color: '#ffd700', fontSize: 18 }}>🏆 New High Score!</p>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <button onClick={() => startGame(selected)} style={{ padding: '12px 24px', background: selected.color, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>Play Again</button>
            <button onClick={reset} style={{ padding: '12px 24px', background: 'transparent', color: '#aaa', border: '1px solid #555', borderRadius: 10, fontSize: 16, cursor: 'pointer' }}>Switch Critter</button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }`}</style>
    </div>
  );
}
