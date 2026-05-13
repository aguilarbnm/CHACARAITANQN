import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const MONTHS = [
  'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025',
  'Mayo 2025', 'Junio 2025', 'Julio 2025', 'Agosto 2025',
  'Septiembre 2025', 'Octubre 2025', 'Noviembre 2025', 'Diciembre 2025'
];

export default function Finances({ currentPlayer, players }) {
  const [finances, setFinances] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [adminPin, setAdminPin] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  // Expense form
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expFecha, setExpFecha] = useState('');

  const fetchFinances = () => {
    fetch(`${API}/api/finances`).then(r => r.json()).then(setFinances).catch(console.error);
  };

  useEffect(() => { fetchFinances(); }, []);

  const verifyPin = async () => {
    setMsg('');
    try {
      const res = await fetch(`${API}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin })
      });
      const data = await res.json();
      if (data.valid) {
        setIsAdmin(true);
        setMsg('✅ Acceso de administrador activado');
        setMsgType('success');
      } else {
        setMsg('❌ PIN incorrecto');
        setMsgType('error');
      }
    } catch (e) {
      setMsg('Error de conexión');
      setMsgType('error');
    }
  };

  const togglePayment = async (player) => {
    if (!isAdmin) return;
    const currentPaid = finances?.payments?.[selectedMonth]?.[player] || false;
    try {
      await fetch(`${API}/api/finances/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin, month: selectedMonth, player, paid: !currentPaid })
      });
      fetchFinances();
    } catch (e) {
      console.error(e);
    }
  };

  const addExpense = async () => {
    if (!expDesc || !expAmount) {
      setMsg('Completá descripción y monto');
      setMsgType('error');
      return;
    }
    try {
      const res = await fetch(`${API}/api/finances/expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          fecha: expFecha || null,
          description: expDesc,
          amount: Number(expAmount),
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setMsg('✅ Gasto registrado');
        setMsgType('success');
        setExpDesc(''); setExpAmount(''); setExpFecha('');
        fetchFinances();
      } else {
        const data = await res.json();
        setMsg(data.error || 'Error');
        setMsgType('error');
      }
    } catch (e) {
      setMsg('Error de conexión');
      setMsgType('error');
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    try {
      await fetch(`${API}/api/finances/expense/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin, id })
      });
      fetchFinances();
    } catch (e) {
      console.error(e);
    }
  };

  const formatMoney = (n) => {
    return '$' + Number(n).toLocaleString('es-AR');
  };

  if (!finances) return <div className="card"><p>Cargando finanzas...</p></div>;

  const monthPayments = finances.payments[selectedMonth] || {};
  const paidCount = Object.values(monthPayments).filter(Boolean).length;

  return (
    <div>
      {/* Summary Dashboard - visible to all */}
      <div className="card">
        <h2>💰 Finanzas — Dashboard</h2>
        <div className="finance-summary">
          <div className="finance-box income">
            <h3>Ingresos Totales</h3>
            <div className="amount">{formatMoney(finances.totalIncome)}</div>
          </div>
          <div className="finance-box expenses">
            <h3>Gastos Totales</h3>
            <div className="amount">{formatMoney(finances.totalExpenses)}</div>
          </div>
          <div className="finance-box balance">
            <h3>Balance</h3>
            <div className="amount">{formatMoney(finances.balance)}</div>
          </div>
        </div>
        <p style={{color: '#666', fontSize: '0.85rem'}}>
          Cuota mensual: {formatMoney(finances.monthlyFee)} por jugador | Alquiler cancha: {formatMoney(finances.fieldCost)} por partido
        </p>
      </div>

      {/* Payment status - visible to all */}
      <div className="card">
        <h3>Estado de Cuotas — {selectedMonth}</h3>
        <div className="month-select">
          <label>Mes:</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span style={{color: '#666', fontSize: '0.85rem'}}>
            ({paidCount}/{players.length} pagaron)
          </span>
        </div>
        <div className="payment-grid">
          {players.map(p => {
            const paid = monthPayments[p] || false;
            return (
              <div key={p} className="payment-item">
                <span className="player-name">{p}</span>
                {isAdmin ? (
                  <button
                    className={`payment-toggle ${paid ? 'paid' : 'unpaid'}`}
                    onClick={() => togglePayment(p)}
                  >
                    {paid ? '✅ Pagó' : '❌ Debe'}
                  </button>
                ) : (
                  <span className={`attendance-status ${paid ? 'status-confirmed' : 'status-absent'}`}>
                    {paid ? 'Pagó' : 'Debe'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses list - visible to all */}
      <div className="card">
        <h3>Gastos Registrados</h3>
        {finances.expenses.length === 0 ? (
          <p style={{color: '#666', fontStyle: 'italic'}}>No hay gastos registrados.</p>
        ) : (
          <ul className="expense-list">
            {finances.expenses.map(exp => (
              <li key={exp.id}>
                <div>
                  <strong>{exp.description}</strong>
                  {exp.fecha && <span style={{color: '#666', marginLeft: 8, fontSize: '0.85rem'}}>Fecha {exp.fecha}</span>}
                  <br/>
                  <span style={{color: '#666', fontSize: '0.8rem'}}>{exp.date}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{fontWeight: 700, color: '#C8102E'}}>{formatMoney(exp.amount)}</span>
                  {isAdmin && (
                    <button className="expense-delete" onClick={() => deleteExpense(exp.id)} title="Eliminar">
                      🗑️
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Admin Section */}
      <div className="admin-section">
        <h3>🔐 Zona de Administrador</h3>
        {!isAdmin ? (
          <div>
            <p style={{fontSize: '0.85rem', color: '#666', marginBottom: 12}}>
              Solo el administrador puede modificar pagos y registrar gastos. Ingresá el PIN para acceder.
            </p>
            <div className="admin-pin-form">
              <input
                type="password"
                placeholder="PIN"
                value={adminPin}
                onChange={e => setAdminPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyPin()}
              />
              <button className="btn btn-primary" onClick={verifyPin}>Ingresar</button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{fontSize: '0.85rem', color: '#155724', marginBottom: 12}}>
              ✅ Modo administrador activo. Podés modificar pagos arriba y registrar gastos abajo.
            </p>
            <h3 style={{marginTop: 16}}>Registrar Nuevo Gasto</h3>
            <div className="expense-form">
              <div className="field">
                <label>Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Alquiler cancha"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Monto ($)</label>
                <input
                  type="number"
                  placeholder="245000"
                  value={expAmount}
                  onChange={e => setExpAmount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Fecha (opcional)</label>
                <select value={expFecha} onChange={e => setExpFecha(e.target.value)}>
                  <option value="">Sin fecha</option>
                  {Array.from({length: 17}, (_, i) => i + 1).map(f => (
                    <option key={f} value={f}>Fecha {f}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={addExpense}>Agregar Gasto</button>
            </div>
            <button
              className="btn btn-secondary"
              style={{marginTop: 12}}
              onClick={() => { setIsAdmin(false); setAdminPin(''); }}
            >
              Salir del modo admin
            </button>
          </div>
        )}
        {msg && <div className={msgType === 'success' ? 'msg-success' : 'msg-error'} style={{marginTop: 12}}>{msg}</div>}
      </div>
    </div>
  );
}
