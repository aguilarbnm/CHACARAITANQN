import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Header from './components/Header'
import PlayerSelect from './components/PlayerSelect'
import Finances from './components/Finances'
import Voting from './components/Voting'
import Attendance from './components/Attendance'
import Fixture from './components/Fixture'
import Ranking from './components/Ranking'
import './App.css'

const API = import.meta.env.VITE_API_URL || '';

function App() {
  const [currentPlayer, setCurrentPlayer] = useState(localStorage.getItem('chacarita_player') || '');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/players`).then(r => r.json()).then(setPlayers).catch(console.error);
  }, []);

  const handleSelectPlayer = (name) => {
    setCurrentPlayer(name);
    localStorage.setItem('chacarita_player', name);
  };

  const handleLogout = () => {
    setCurrentPlayer('');
    localStorage.removeItem('chacarita_player');
  };

  if (!currentPlayer) {
    return (
      <div className="app">
        <Header />
        <PlayerSelect players={players} onSelect={handleSelectPlayer} />
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="user-bar">
          <span className="user-name">👤 {currentPlayer}</span>
          <button className="btn-logout" onClick={handleLogout}>Cambiar jugador</button>
        </div>
        <nav className="main-nav">
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            📅 Fixture
          </NavLink>
          <NavLink to="/asistencia" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            ✅ Asistencia
          </NavLink>
          <NavLink to="/votacion" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            ⚽ Votación
          </NavLink>
          <NavLink to="/ranking" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            🏆 Balón de Oro
          </NavLink>
          <NavLink to="/finanzas" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            💰 Finanzas
          </NavLink>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Fixture />} />
            <Route path="/asistencia" element={<Attendance currentPlayer={currentPlayer} players={players} />} />
            <Route path="/votacion" element={<Voting currentPlayer={currentPlayer} players={players} />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/finanzas" element={<Finances currentPlayer={currentPlayer} players={players} />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>CHACARITANQN © 2025 — Gestión de Equipo</p>
        </footer>
      </div>
    </Router>
  );
}

export default App
