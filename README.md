# 🏭 Digital Twin-Based Asset Management System (DTAM)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20WebGL-black.svg)](https://threejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-SQLite-blueviolet.svg)](https://prisma.io)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time%20Stream-orange.svg)](https://socket.io)

A complete, production-grade **Digital Twin-Based Asset Management System** for heavy industrial manufacturing, powertrain equipment, and critical machinery.

---

## 🌟 Core Highlights

- **Interactive 3D WebGL Digital Twins**: Parametric Three.js / React Three Fiber models (Centrifugal Pumps, 5-Axis CNC Milling Centers, Heavy Induction Motors, Rotary Screw Compressors, Cooling Towers) with live rotating shafts, harmonic vibrations, and clickable component diagnostics.
- **Real-Time IoT Simulation Engine**: Physics-based gradual random-walk sensor drift modeling temperature, vibration velocity, pressure, active power (kW), and RPM with real-time Socket.IO synchronization (zero browser refresh required).
- **Interactive "Simulate Failure" Mode**: 1-click failure injector that progressively escalates bearing friction, thermal runaway, and dynamic pressure spikes, automatically triggering **CRITICAL** alarms and dropping health scores in real time for college & client demonstrations.
- **Multi-Factor Health Scoring**: Algorithmic 0–100% health calculation weighting temperature (20%), vibration (20%), pressure (15%), energy (15%), operating hours (10%), maintenance history (10%), and failure risk penalties (10%).
- **Prescriptive Maintenance & Work Order Hub**: Kanban & Table work order management with technician dispatching, parts replacement tracking, repair cost accounting, and auto-overdue detection.
- **Enterprise RBAC**: Role-based access control supporting `ADMIN`, `MANAGER`, `TECHNICIAN`, and `VIEWER` with pre-seeded demo credentials.
- **ISO-13374 Grade Reporting & Exports**: On-demand generation of Asset Health, Maintenance History, Sensor Calibration, and Incident reports with 1-click **PDF** and **CSV** downloads.
- **Zero External Paid APIs**: Powered locally by SQLite + Prisma ORM and an embedded IoT simulator.

---

## 📐 System Architecture

```
Physical Asset Layer (Pumps, Motors, CNCs, Compressors, Boilers)
           │
           ▼
IoT Sensor Array (Temp °C, Vibration mm/s, Pressure bar, Energy kW, RPM)
           │
           ▼
Real-Time Ingestion (Socket.IO + Express REST)
           │
           ▼
Digital Twin Synchronization Engine (Kinematic 3D Three.js State)
           │
           ▼
Predictive & Anomaly Detection (Rate-of-Change & Threshold Alarms)
           │
           ▼
Maintenance Work Order Hub (Technician Dispatch & Spare Parts)
           │
           ▼
Executive Cockpit & Command Dashboard (Recharts + PDF/CSV Reporting)
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 2. Automated Installation & Setup
Clone or enter the project directory:

```bash
cd "d:/gnnanasai/digital twin management"

# 1. Install all dependencies across root, server, and client
npm run install:all

# 2. Initialize SQLite database schema and seed rich realistic demo data
npm run setup:db
```

### 3. Launch Development Environment
Run both backend API server (`port 5000`) and frontend Vite client (`port 5173`) simultaneously:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API & WebSockets**: `http://localhost:5000`
- **API Health Endpoint**: `http://localhost:5000/api/health`

---

## 🔑 Demo Login Credentials

DTAM comes pre-populated with demo accounts for all 4 security roles:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `Admin@123` | Full access (CRUD, settings, thresholds, user logs) |
| **MANAGER** | `manager@example.com` | `Manager@123` | Asset management, analytics, maintenance, reports |
| **TECHNICIAN**| `technician@example.com`| `Tech@123` | Work orders, alert acknowledgment, sensor checks |
| **VIEWER** | `viewer@example.com` | `Viewer@123` | Read-only executive dashboard & telemetry |

*Note: On the login page, you can also use the **1-Click Quick Demo Login** buttons to automatically authenticate.*

---

## 🎮 Interactive Live Demo & Failure Simulation

To demonstrate the reactive power of the Digital Twin during a presentation or exam:

1. Log in as **Admin** or **Manager**.
2. Click **"Simulation Hub"** in the top navigation bar (or open the widget on the Dashboard).
3. Under **"Interactive Failure Simulation"**, select any asset (e.g. `PRS-009` or `PUMP-001`).
4. Click **"Simulate Failure"**:
   - Observe sensor values gradually escalating (Temperature > 85°C, Vibration > 8.0 mm/s).
   - Watch the asset health score drop from 95% down into the CRITICAL range (< 40%).
   - A **CRITICAL ALARM** will appear instantly across the Dashboard and Alert Center.
   - The predictive failure risk jumps to > 80% with an urgent prescriptive recommendation.
5. Click **"Reset Simulation"** to return the machine to healthy nominal baselines.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` - Authenticate with email & password, returns JWT token.
- `POST /api/auth/register` - Create a new user.
- `GET /api/auth/profile` - Retrieve current authenticated user profile.
- `GET /api/auth/users` - Retrieve all plant operators (Admin/Manager only).

### Asset Inventory
- `GET /api/assets` - Filter and search physical assets (status, type, location, criticality).
- `GET /api/assets/stats` - Fleet-wide KPI metrics (healthy, warning, critical, average health).
- `GET /api/assets/:id` - Full asset specifications, sensors, and active alarms.
- `POST /api/assets` - Register a new physical machine and initialize its Digital Twin.
- `PUT /api/assets/:id` - Update asset specifications.
- `DELETE /api/assets/:id` - Delete an asset and associated digital twin.

### Digital Twins & 3D Telemetry
- `GET /api/digital-twins` - Retrieve all digital twin virtual representations.
- `GET /api/digital-twins/:assetId` - Retrieve detailed twin state and sensor values snapshot.
- `GET /api/digital-twins/:assetId/history?range=24h` - Telemetry time series (1h, 24h, 7d, 30d).
- `POST /api/digital-twins/:assetId/sync` - Manually trigger twin state synchronization.
- `POST /api/digital-twins/:assetId/simulate-failure` - Inject thermal & mechanical failure.
- `POST /api/digital-twins/:assetId/reset-simulation` - Restore nominal simulation baseline.

### Maintenance Work Orders
- `GET /api/maintenance` - Retrieve maintenance tasks with status and priority filters.
- `POST /api/maintenance` - Create a new work order and assign technician.
- `PUT /api/maintenance/:id` - Update status (SCHEDULED, IN_PROGRESS, COMPLETED, OVERDUE), cost & parts.
- `DELETE /api/maintenance/:id` - Remove a maintenance task.

### Anomaly Alerts
- `GET /api/alerts` - Retrieve active or historical alarms (CRITICAL, WARNING, INFO).
- `PUT /api/alerts/:id/acknowledge` - Operator acknowledgment log.
- `PUT /api/alerts/:id/resolve` - Mark incident as resolved.

### Analytics & Reports
- `GET /api/analytics/overview?range=30d` - Health distribution, energy timeline, failure rankings.
- `GET /api/reports/assets` - Formatted asset health compliance report data.
- `GET /api/reports/maintenance` - Formatted maintenance history data.
- `GET /api/reports/sensors` - Formatted sensor calibration telemetry.
- `GET /api/reports/alerts` - Formatted incident alarm logs.

---

## 🧪 Running Automated Tests

DTAM includes an automated test suite verifying mathematical health calculations, predictive failure probabilities, JWT authentication, and database integrity:

```bash
npm test
```

---

## 🛠️ Project Monorepo Structure

```
digital-twin-asset-management/
├── package.json               # Root monorepo scripts & dependencies
├── README.md                  # Documentation & system reference
├── .env.example               # Environment variables template
│
├── server/                    # Node.js + Express + Prisma + Socket.IO Backend
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma      # 11 Relational Data Models
│   │   └── seed.js            # 10 Assets, 42 Sensors & 30-day History Seeder
│   └── src/
│       ├── app.js             # Express & Socket.IO Entrypoint
│       ├── config/            # Constants & Database Client
│       ├── controllers/       # Modular REST API Controllers
│       ├── middleware/        # JWT Auth, RBAC & Error Handlers
│       ├── routes/            # Express Routers
│       ├── services/          # Health Score & Failure Prediction Algorithms
│       ├── simulator/         # IoT Physics-Based Sensor Simulator
│       ├── sockets/           # Real-Time Telemetry Event Handlers
│       └── tests/             # Automated Algorithm & CRUD Test Suite
│
└── client/                    # React 18 + Vite + Tailwind + Three.js Frontend
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx            # React Router Architecture & Protected Routes
        ├── main.jsx           # Client Entrypoint
        ├── index.css          # Dark Industrial Design Tokens
        ├── components/        # Reusable UI & Gauges (StatCard, CircularGauge, etc.)
        ├── context/           # AuthContext & SocketContext Real-Time State
        ├── digital-twin/      # Three.js 3D WebGL Canvas & Kinematic Models
        ├── pages/             # 13 Application Views (Dashboard, 3D Twins, etc.)
        └── utils/             # Formatters, Status Colors, PDF & CSV Exporters
```

---

## ⚖️ License
MIT License - Open for educational and commercial industrial asset management use.
