import teamPhoto from '../assets/team_photo_enhanced.png';

export default function PlayerSelect({ players, onSelect }) {
  return (
    <div className="player-select-container">
      <div className="hero-section">
        <img src={teamPhoto} alt="Equipo chacaritanqn" className="team-photo-hero" />
        <div className="hero-overlay">
          <h2>Bienvenido a chacaritanqn</h2>
          <p>Seleccioná tu nombre para ingresar</p>
        </div>
      </div>
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
