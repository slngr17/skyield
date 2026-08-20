# ☀️ Skyield — Hyperlocal Microclimate & Solar Potential Analyzer

> AI-powered rooftop solar assessment and rainwater harvesting calculator — built for the **AI 4 Earth Hackathon**.

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![React](https://img.shields.io/badge/react-18-61dafb)

## 🎯 What It Does

Drop a pin on the map, optionally upload a rooftop photo, and instantly get:

- **Solar energy potential** — daily, monthly, and annual kWh estimates
- **Rainwater harvesting capacity** — annual collection in liters
- **AI roof analysis** — detects roof type, usable area, shading, and obstructions via Google Gemini Vision
- **Hardware recommendations** — panel count, inverter size, battery capacity
- **Carbon offset** — estimated CO₂ savings per year

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React +   │────▶│  FastAPI      │────▶│  Open-Meteo API │
│   Leaflet   │     │  Backend      │     │  (Solar/Weather)│
│   Frontend  │     │               │────▶│  Google Gemini  │
└─────────────┘     └──────────────┘     │  (Vision AI)    │
                                          └─────────────────┘
```

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, Tailwind CSS, Leaflet, Lucide Icons |
| Backend   | Python 3.11+, FastAPI, Pydantic, httpx |
| Data APIs | Open-Meteo Solar & Weather API (free, no key) |
| AI Layer  | Google Gemini 1.5 Flash (multimodal vision) |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) Google Gemini API key for AI roof analysis

### 1. Clone & Setup Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Optional: Add Gemini API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:8000`.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/solar-data?lat=&lon=` | Fetch solar irradiance & rainfall data |
| POST | `/api/analyze-roof` | Upload rooftop image for AI analysis |
| POST | `/api/calculate` | Compute solar yield, rainwater, & hardware |

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No | Google Gemini API key. Without it, roof analysis returns mock data. |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend URL (defaults to proxy in dev) |

## 📊 Calculation Methodology

- **Solar Yield**: `Area × GHI × Panel Efficiency (18%) × Performance Ratio (0.75) × (1 - Shading Factor)`
- **Rainwater Capture**: `Roof Area (m²) × Annual Rainfall (mm) × Runoff Coefficient (0.85)`
- **Carbon Offset**: `Annual Solar Yield (kWh) × 0.42 kg CO₂e/kWh` (global average grid factor)

## 📄 Data Sources

- **Solar & Weather Data**: [Open-Meteo API](https://open-meteo.com/) — free, open-source weather API
- **AI Vision Analysis**: [Google Gemini](https://ai.google.dev/) — multimodal AI model

## 📝 License

MIT License — built for the AI 4 Earth Hackathon 2026.
