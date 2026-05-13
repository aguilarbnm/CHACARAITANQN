import logo from '../assets/logo.png';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-stripes">
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
      </div>
      <div className="header-content">
        <img src={logo} alt="chacaritanqn logo" className="team-logo" />
        <div className="header-text">
          <h1>chacaritanqn</h1>
          <p>Gestión de Equipo</p>
        </div>
      </div>
      <div className="header-bottom-stripes">
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
        <div className="stripe"></div>
      </div>
    </header>
  );
}
