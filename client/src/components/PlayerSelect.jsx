export default function PlayerSelect({ players, onSelect }) {
  return (
    <div className="player-select-container">
      <h2>Bienvenido a CHACARITANQN</h2>
      <p>Seleccioná tu nombre para ingresar</p>
      <div className="player-grid">
        {players.map(p => (
          <button key={p} className="player-btn" onClick={() => onSelect(p)}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
