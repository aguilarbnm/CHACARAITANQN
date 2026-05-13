import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

export default function Fixture() {
  const [fixture, setFixture] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/fixture`).then(r => r.json()).then(setFixture).catch(console.error);
  }, []);

  return (
    <div className="card">
      <h2>📅 Fixture — Temporada 2025</h2>
      <ul className="fixture-list">
        {fixture.map(f => (
          <li key={f.fecha} className="fixture-item">
            <span className="fixture-fecha">Fecha {f.fecha}</span>
            <span className="fixture-match">
              <span>CHACARITANQN</span> vs {f.rival}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
