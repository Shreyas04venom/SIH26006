# ASTRA — Maritime Decision & Intelligence Engine

Unified Maritime Intelligence Platform for Overseas → East Coast India Bulk Cargo Operations.

---

## 🚀 Quick Start (Single Command)

To run the complete application (Frontend + Backend API + Simulation Models):

```bash
cd astra-app
npm start
```
> The application will immediately be running on **http://localhost:8080**

Alternatively, for active frontend development with hot-reloading:
```bash
cd astra-app
npm run dev
```
> Runs the development server on **http://localhost:3000** with embedded API proxy.

---

## 🔑 Login Credentials / Presets

ASTRA comes configured with 4 quick role presets ready on the login screen:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Logistics / Procurement Manager** | `logistics@astra.io` | `test123` |
| **Chartering Operator** | `chartering@astra.io` | `test123` |
| **Vessel Operator** | `vessel@astra.io` | `test123` |
| **System Administrator** | `admin@astra.io` | `admin123` |

---

## 📦 Project Structure

```
astra-app/
├── server/
│   ├── api.js                # Full Express API & Analytics engine
│   └── index.js              # Standalone Express Server + Static file host
├── src/
│   ├── components/
│   │   ├── Badge.jsx         # Status and category badges
│   │   ├── EastCoastMap.jsx  # Interactive SVG map of East Coast India
│   │   ├── Layout.jsx        # Navigation shell layout
│   │   ├── Sidebar.jsx       # Side navigation bar
│   │   └── Topbar.jsx        # Top header with search & profile
│   ├── lib/
│   │   ├── api.js            # Axios client with bearer token support
│   │   ├── auth.jsx          # Authentication context
│   │   └── flow.jsx          # Cargo workflow state manager
│   ├── pages/
│   │   ├── Dashboard.jsx        # Command center with KPIs & map
│   │   ├── DecisionHistory.jsx  # Audit log of recorded voyage decisions
│   │   ├── FreightForecast.jsx  # Recharts forward freight curve & trend
│   │   ├── Login.jsx            # Sign-in page with 1-click role presets
│   │   ├── NewRequirement.jsx   # 5-step Cargo Requirement wizard
│   │   ├── Placeholder.jsx      # Roadmap phase placeholders
│   │   ├── PortIntelligence.jsx # 12 East Coast India ports database
│   │   ├── RouteIntelligence.jsx# Unified Decision Support engine
│   │   ├── Validation.jsx       # Pipeline verification animation
│   │   ├── VesselMatching.jsx   # Cost-optimization fleet ranking
│   │   └── WaitingRisk.jsx      # Waiting time & idle-risk models
│   ├── App.jsx               # React router config
│   ├── index.css             # Tailwind + ASTRA Design System tokens
│   └── main.jsx              # React DOM entry point
├── dist/                     # Optimized production bundle
├── package.json              # Dependencies and start scripts
├── tailwind.config.js        # Color tokens & typography configuration
└── vite.config.js            # Vite configuration with API middleware
```

---

## 🛠️ Features & Workflow

1. **Operations Dashboard**: Real-time KPI cards, East Coast India active voyages map, freight forecast snapshot, fleet health cards, and live priority alerts.
2. **5-Step Cargo Wizard**: Input cargo specs, origin ports (Australia, Indonesia, South Africa, etc.), East Coast India discharge ports, delivery schedules, and preferences.
3. **Pipeline Validation**: Animated validation steps checking cargo, route, drafts, and availability before model ingestion.
4. **Freight Rate Forecasting**: Forward curve projections, trailing historical actuals, and AI-driven factor explanations.
5. **Waiting & Idle Risk**: Expected anchorage delays and composite idle-time risk distribution.
6. **Vessel Matching & Optimization**: Fleet ranking factoring freight rates, bunker fuel consumption, demurrage proxy, and capacity utilization.
7. **Rule-Based Compatibility**: Automatic checks of vessel draft, LOA, beam, and cargo capacity against port physical constraints.
8. **Decision History**: Permanent audit log of accepted and simulated voyage fixtures.
