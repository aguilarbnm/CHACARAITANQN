import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const FECHAS = [];
for (let i = 1; i <= 17; i++) FECHAS.push(i);

const RIVALS = {
  1: "Setenta", 2: "Club A. Senillosa", 3: "D´Rabona", 4: "Albo +34",
  5: "El Bigote de Checho", 6: "Yupanky F.C. +34", 7: "C.F. Mudón",
  8: "V8 F.C.", 9: "La Roma", 10: "Chainas", 11: "Parque Club",
  12: "Anonymous", 13: "Don Bosco F.C.", 14: "Sudacas",
  15: "Maradonianos", 16: "IPA F.C.", 17: "Manso Equipo"
};

export default function Voting({ currentPlayer, players }) {
  const [selectedFecha, setSelectedFecha] = useState(1);
  const [votes, setVotes] = useState({});
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  const fetchVotes = () => {
    fetch(`${API}/api/votes`).then(r => r.json()).then(setVotes).catch(console.error);
  };

  useEffect(() => { fetchVotes(); }, []);

  const key = `fecha-${selectedFecha}`;
  const fechaVotes = votes[key] || {};
  const hasVoted = !!fechaVotes[currentPlayer];
  const otherPlayers = players.filter(p => p !== currentPlayer);

  const handleVote = async () => {
    setMsg('');
    if (!first || !second || !third) {
      setMsg('Debés seleccionar los 3 puestos');
      setMsgType('error');
      return;
    }
    if (first === second || first === third || second === third) {
      setMsg('No podés votar al mismo jugador en más de un puesto');
      setMsgType('error');
      return;
    }

    try {
      const res = await fetch(`${API}/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: selectedFecha, voter: currentPlayer, first, second, third })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('✅ Voto registrado correctamente');
        setMsgType('success');
        fetchVotes();
        setFirst(''); setSecond(''); setThird('');
      } else {
        setMsg(data.error || 'Error al votar');
        setMsgType('error');
      }
    } catch (e) {
      setMsg('Error de conexión');
      setMsgType('error');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>⚽ Votación — Jugador del Partido</h2>
        <div className="attendance-fecha-select">
          <label>Fecha:</label>
          <select value={selectedFecha} onChange={e => { setSelectedFecha(Number(e.target.value)); setMsg(''); }}>
            {FECHAS.map(f => (
              <option key={f} value={f}>Fecha {f} — vs {RIVALS[f]}</option>
            ))}
          </select>
        </div>

        {hasVoted ? (
          <div className="msg-success">
            Ya votaste en esta fecha. Tu voto: 🥇 {fechaVotes[currentPlayer].first}, 🥈 {fechaVotes[currentPlayer].second}, 🥉 {fechaVotes[currentPlayer].third}
          </div>
        ) : (
          <div className="vote-form">
            <div className="vote-field">
              <label>🥇 1er Puesto <span className="points-badge">3 pts</span></label>
              <select value={first} onChange={e => setFirst(e.target.value)}>
                <option value="">Seleccionar jugador...</option>
                {otherPlayers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="vote-field">
              <label>🥈 2do Puesto <span className="points-badge">2 pts</span></label>
              <select value={second} onChange={e => setSecond(e.target.value)}>
                <option value="">Seleccionar jugador...</option>
                {otherPlayers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="vote-field">
              <label>🥉 3er Puesto <span className="points-badge">1 pt</span></label>
              <select value={third} onChange={e => setThird(e.target.value)}>
                <option value="">Seleccionar jugador...</option>
                {otherPlayers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleVote}>Enviar Voto</button>
          </div>
        )}

        {msg && <div className={msgType === 'success' ? 'msg-success' : 'msg-error'} style={{marginTop: 12}}>{msg}</div>}
      </div>

      <div className="card">
        <h3>Votos de Fecha {selectedFecha} — vs {RIVALS[selectedFecha]} (Abiertos)</h3>
        {Object.keys(fechaVotes).length === 0 ? (
          <p style={{color: '#666', fontStyle: 'italic'}}>Aún no hay votos para esta fecha.</p>
        ) : (
          <table className="votes-table">
            <thead>
              <tr>
                <th>Votante</th>
                <th>🥇 1° (3pts)</th>
                <th>🥈 2° (2pts)</th>
                <th>🥉 3° (1pt)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(fechaVotes).map(([voter, v]) => (
                <tr key={voter}>
                  <td><strong>{voter}</strong></td>
                  <td>{v.first}</td>
                  <td>{v.second}</td>
                  <td>{v.third}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
