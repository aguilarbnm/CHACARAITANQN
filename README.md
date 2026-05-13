# CHACARITANQN — Gestión de Equipo

Aplicación web para la gestión del equipo de fútbol amateur **CHACARITANQN**.

---

## Módulos

### 📅 Fixture
Calendario completo de las 17 fechas del torneo con todos los rivales.

### ✅ Asistencia
Cada jugador puede confirmar o marcar ausencia para cada fecha. Se muestra la lista de confirmados, ausentes y pendientes.

### ⚽ Votación (Jugador del Partido)
Después de cada partido, cada jugador vota asignando:
- 1er puesto: 3 puntos
- 2do puesto: 2 puntos
- 3er puesto: 1 punto

Los votos son **abiertos** (todos pueden ver quién votó a quién). No se puede votar a uno mismo ni repetir jugadores.

### 🏆 Balón de Oro
Ranking acumulado de puntos de todas las votaciones. Se actualiza automáticamente cada 10 segundos.

### 💰 Finanzas
- **Dashboard público**: Todos los jugadores pueden ver ingresos, gastos y balance.
- **Cuotas**: Se visualiza quién pagó y quién debe por mes.
- **Gastos**: Lista de gastos registrados.
- **Zona Admin** (protegida por PIN): Solo el administrador puede marcar pagos y registrar/eliminar gastos.

---

## Datos Clave

| Concepto | Valor |
|---|---|
| Cuota mensual por jugador | $60.000 |
| Alquiler cancha por partido | $245.000 |
| PIN de administrador | `1234` |

> **Importante**: Cambiá el PIN de administrador en el archivo `server/index.js` (variable `ADMIN_PIN`) antes de usar en producción.

---

## Cómo Ejecutar

### Requisitos
- Node.js v18 o superior

### Instalación

```bash
# 1. Instalar dependencias del servidor
cd server
npm install

# 2. Instalar dependencias del cliente
cd ../client
npm install

# 3. Compilar el cliente
npm run build

# 4. Copiar archivos compilados al servidor
cp -r dist/* ../server/public/

# 5. Iniciar el servidor
cd ../server
node index.js
```

La aplicación estará disponible en `http://localhost:3001`

### Para desarrollo

```bash
# Terminal 1: Servidor
cd server && node index.js

# Terminal 2: Cliente (con hot reload)
cd client && npm run dev
```

---

## Estructura del Proyecto

```
chacaritanqn/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── PlayerSelect.jsx
│   │   │   ├── Fixture.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Voting.jsx
│   │   │   ├── Ranking.jsx
│   │   │   └── Finances.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── vite.config.js
├── server/                 # Backend Express
│   ├── index.js
│   ├── data/               # Datos persistentes (JSON)
│   └── public/             # Frontend compilado
└── README.md
```

---

## Despliegue en Producción

Para desplegar en un servidor (VPS, Render, Railway, etc.):

1. Subí la carpeta `server/` (con `public/` incluido) al servidor.
2. Ejecutá `npm install` en la carpeta `server/`.
3. Configurá la variable de entorno `PORT` si es necesario.
4. Ejecutá `node index.js` (o usá PM2: `pm2 start index.js`).

### Despliegue rápido en Render.com (gratis)

1. Subí el proyecto a un repositorio de GitHub.
2. Creá un nuevo "Web Service" en [render.com](https://render.com).
3. Conectá tu repositorio.
4. Configurá:
   - **Build Command**: `cd client && npm install && npm run build && cp -r dist/* ../server/public/`
   - **Start Command**: `cd server && node index.js`
   - **Root Directory**: (dejar vacío)
5. Deploy.

---

## Jugadores Registrados

Lucas Álvarez, Nico Aguilar, Dani García, Kevin Aguilar, Luis Padilla, Walter Rojas, Luis Erices, Nico Quiniñir, Gonza, Darío Sánchez, Nahuel Aguilar, Martín Mastracci, Marcelo Mastracci, GOLIL, Rodrigo Marcolini, Randi Hinojosa, Bebo, Esteban Funes, Guille Casanova.
