import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const FIXTURE = [];
for (let i = 1; i <= 17; i++) FIXTURE.push(i);

export default function Attendance({ currentPlayer, players }) {
  const [selectedFecha, setSelectedFecha] = useState(1);
  const [attendance, setAttendance] = useState({});
  const [msg, setMsg] = useState('');

  const fetchAttendance = () => {
    fetch(`${API}/api/attendance`).then(r => r.json()).then(setAttendance).catch(console.error);
  };

  useEffect(() => { fetchAttendance(); }, []);

  const handleAttendance = async (status) => {
    setMsg('');
    try {
      const res = await fetch(`${API}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: selectedFecha, player: currentPlayer, status })
      });
      if (res.ok) {
        setMsg(status === 'confirmed' ? '✅ Asistencia confirmada' : '❌ Ausencia registrada');
        fetchAttendance();
      }
    } catch (e) {
      setMsg('Error al registrar');
    }
  };

  const key = `fecha-${selectedFecha}`;
  const fechaData = attendance[key] || {};
  const confirmed = players.filter(p => fechaData[p] === 'confirmed');
  const absent = players.filter(p => fechaData[p] === 'absent');
  const pending = players.filter(p => !fechaData[p]);
  const myStatus = fechaData[currentPlayer];

  return (
    <div>
      <div className="card">
        <h2>✅ Asistencia</h2>
        <div className="attendance-fecha-select">
          <label>Seleccionar fecha:</label>
          <select value={selectedFecha} onChange={e => { setSelectedFecha(Number(e.target.value)); setMsg(''); }}>
            {FIXTURE.map(f => (
              <option key={f} value={f}>Fecha {f}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong>Tu estado para Fecha {selectedFecha}: </strong>
          {myStatus === 'confirmed' && <span className="attendance-status status-confirmed">Confirmado</span>}
          {myStatus === 'absent' && <span className="attendance-status status-absent">Ausente</span>}
          {!myStatus && <span className="attendance-status status-pending">Pendiente</span>}
        </div>

        <div className="attendance-actions">
          <button className="btn btn-confirm" onClick={() => handleAttendance('confirmed')}>
            ✅ Confirmar
          </button>
          <button className="btn btn-absent" onClick={() => handleAttendance('absent')}>
            ❌ Ausente
          </button>
        </div>

        {msg && <div className={msg.includes('✅') ? 'msg-success' : 'msg-error'}>{msg}</div>}
      </div>

      <div className="card">
        <h3>Confirmados ({confirmed.length})</h3>
        <div className="confirmed-count">{confirmed.length} jugadores confirmados</div>
        <ul className="attendance-list">
          {confirmed.map(p => (
            <li key={p}>
              <span>{p}</span>
              <span className="attendance-status status-confirmed">Confirmado</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Ausentes ({absent.length})</h3>
        <ul className="attendance-list">
          {absent.map(p => (
            <li key={p}>
              <span>{p}</span>
              <span className="attendance-status status-absent">Ausente</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Pendientes ({pending.length})</h3>
        <ul className="attendance-list">
          {pending.map(p => (
            <li key={p}>
              <span>{p}</span>
              <span className="attendance-status status-pending">Pendiente</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
