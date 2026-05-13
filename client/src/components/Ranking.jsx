import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

export default function Ranking() {
  const [ranking, setRanking] = useState([]);

  const fetchRanking = () => {
    fetch(`${API}/api/ranking`).then(r => r.json()).then(setRanking).catch(console.error);
  };

  useEffect(() => {
    fetchRanking();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchRanking, 10000);
    return () => clearInterval(interval);
  }, []);

  const getMedal = (idx) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return '';
  };

  const hasAnyPoints = ranking.some(r => r.points > 0);

  return (
    <div className="card">
      <h2>🏆 Balón de Oro — Ranking General</h2>
      {!hasAnyPoints ? (
        <p style={{color: '#666', fontStyle: 'italic', padding: '20px 0'}}>
          Aún no hay votos registrados. El ranking se actualizará automáticamente cuando se emitan votos.
        </p>
      ) : (
        <ul className="ranking-list">
          {ranking.filter(r => r.points > 0).map((r, idx) => (
            <li key={r.name} className="ranking-item">
              <span className="ranking-position">
                {getMedal(idx)} {idx + 1}°
              </span>
              <span className="ranking-name">{r.name}</span>
              <span className="ranking-points">{r.points} pts</span>
            </li>
          ))}
        </ul>
      )}
      <p style={{color: '#999', fontSize: '0.8rem', marginTop: 16, textAlign: 'center'}}>
        Se actualiza automáticamente cada 10 segundos
      </p>
    </div>
  );
}
