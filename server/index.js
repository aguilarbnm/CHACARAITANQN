const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Helper to read/write JSON files
function readData(file, defaultVal) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, JSON.stringify(defaultVal, null, 2));
    return defaultVal;
  }
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}
function writeData(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// Players
const PLAYERS = [
"Bebo",
  "Dani García",
  "Darío Sánchez",
  "Esteban Funes",
  "GOLIL",
  "Gonza",
  "Guille Casanova",
  "Kevin Aguilar",
  "Lucas Álvarez",
  "Luis Erices",
  "Luis Padilla",
  "Marcelo Mastracci",
  "Martín Mastracci",
  "Milton Guzman",
  "Nahuel Aguilar",
  "Nico Aguilar",
  "Nico Quiniñir",
  "Randi Hinojosa",
  "Rodrigo Marcolini",
  "Walter Rojas"
];

// Fixture
const FIXTURE = [
  { fecha: 1, rival: "Setenta" },
  { fecha: 2, rival: "Club A. Senillosa" },
  { fecha: 3, rival: "D´Rabona" },
  { fecha: 4, rival: "Albo +34" },
  { fecha: 5, rival: "El Bigote de Checho" },
  { fecha: 6, rival: "Yupanky F.C. +34" },
  { fecha: 7, rival: "C.F. Mudón" },
  { fecha: 8, rival: "V8 F.C." },
  { fecha: 9, rival: "La Roma" },
  { fecha: 10, rival: "Chainas" },
  { fecha: 11, rival: "Parque Club" },
  { fecha: 12, rival: "Anonymous" },
  { fecha: 13, rival: "Don Bosco F.C." },
  { fecha: 14, rival: "Sudacas" },
  { fecha: 15, rival: "Maradonianos" },
  { fecha: 16, rival: "IPA F.C." },
  { fecha: 17, rival: "Manso Equipo" }
];

const ADMIN_PIN = "1234";
const MONTHLY_FEE = 60000;
const FIELD_COST = 245000;

// --- ROUTES ---

// Get players
app.get('/api/players', (req, res) => {
  res.json(PLAYERS);
});

// Get fixture
app.get('/api/fixture', (req, res) => {
  res.json(FIXTURE);
});

// --- FINANCES ---
app.get('/api/finances', (req, res) => {
  const finances = readData('finances.json', { payments: {}, expenses: [] });
  // payments: { "month-year": { "playerName": true/false } }
  // expenses: [ { fecha: number, description: string, amount: number, date: string } ]
  
  let totalIncome = 0;
  for (const month of Object.keys(finances.payments)) {
    for (const player of Object.keys(finances.payments[month])) {
      if (finances.payments[month][player]) {
        totalIncome += MONTHLY_FEE;
      }
    }
  }
  
  let totalExpenses = 0;
  for (const exp of finances.expenses) {
    totalExpenses += exp.amount;
  }
  
  res.json({
    payments: finances.payments,
    expenses: finances.expenses,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    monthlyFee: MONTHLY_FEE,
    fieldCost: FIELD_COST
  });
});

// Admin: toggle player payment
app.post('/api/finances/payment', (req, res) => {
  const { pin, month, player, paid } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ error: 'PIN incorrecto' });
  
  const finances = readData('finances.json', { payments: {}, expenses: [] });
  if (!finances.payments[month]) finances.payments[month] = {};
  finances.payments[month][player] = paid;
  writeData('finances.json', finances);
  res.json({ ok: true });
});

// Admin: add expense
app.post('/api/finances/expense', (req, res) => {
  const { pin, fecha, description, amount, date } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ error: 'PIN incorrecto' });
  
  const finances = readData('finances.json', { payments: {}, expenses: [] });
  finances.expenses.push({ fecha, description, amount, date, id: Date.now() });
  writeData('finances.json', finances);
  res.json({ ok: true });
});

// Admin: delete expense
app.post('/api/finances/expense/delete', (req, res) => {
  const { pin, id } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ error: 'PIN incorrecto' });
  
  const finances = readData('finances.json', { payments: {}, expenses: [] });
  finances.expenses = finances.expenses.filter(e => e.id !== id);
  writeData('finances.json', finances);
  res.json({ ok: true });
});

// Admin: verify pin
app.post('/api/admin/verify', (req, res) => {
  const { pin } = req.body;
  res.json({ valid: pin === ADMIN_PIN });
});

// --- VOTING (Balón de Oro) ---
app.get('/api/votes', (req, res) => {
  const votes = readData('votes.json', {});
  // votes: { "fecha-N": { "voterName": { first: "player", second: "player", third: "player" } } }
  res.json(votes);
});

app.post('/api/votes', (req, res) => {
  const { fecha, voter, first, second, third } = req.body;
  
  if (!fecha || !voter || !first || !second || !third) {
    return res.status(400).json({ error: 'Faltan campos' });
  }
  if (first === second || first === third || second === third) {
    return res.status(400).json({ error: 'No podés votar al mismo jugador en más de un puesto' });
  }
  if (first === voter || second === voter || third === voter) {
    return res.status(400).json({ error: 'No podés votarte a vos mismo' });
  }
  
  const votes = readData('votes.json', {});
  const key = `fecha-${fecha}`;
  if (!votes[key]) votes[key] = {};
  votes[key][voter] = { first, second, third };
  writeData('votes.json', votes);
  res.json({ ok: true });
});

// Ranking (Balón de Oro)
app.get('/api/ranking', (req, res) => {
  const votes = readData('votes.json', {});
  const points = {};
  PLAYERS.forEach(p => points[p] = 0);
  
  for (const fecha of Object.keys(votes)) {
    for (const voter of Object.keys(votes[fecha])) {
      const v = votes[fecha][voter];
      if (v.first && points[v.first] !== undefined) points[v.first] += 3;
      if (v.second && points[v.second] !== undefined) points[v.second] += 2;
      if (v.third && points[v.third] !== undefined) points[v.third] += 1;
    }
  }
  
  const ranking = Object.entries(points)
    .map(([name, pts]) => ({ name, points: pts }))
    .sort((a, b) => b.points - a.points);
  
  res.json(ranking);
});

// --- ATTENDANCE ---
app.get('/api/attendance', (req, res) => {
  const attendance = readData('attendance.json', {});
  // attendance: { "fecha-N": { "playerName": "confirmed" | "absent" } }
  res.json(attendance);
});

app.post('/api/attendance', (req, res) => {
  const { fecha, player, status } = req.body;
  if (!fecha || !player || !status) {
    return res.status(400).json({ error: 'Faltan campos' });
  }
  
  const attendance = readData('attendance.json', {});
  const key = `fecha-${fecha}`;
  if (!attendance[key]) attendance[key] = {};
  attendance[key][player] = status;
  writeData('attendance.json', attendance);
  res.json({ ok: true });
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'public')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
