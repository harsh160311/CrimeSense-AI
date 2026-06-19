# CrimeSense AI

A full-stack crime intelligence and prediction platform with interactive heatmaps, AI-driven analytics, and real-time alerts.

---

## Focus Areas

- Innovation and Creativity — AI-powered crime prediction, DBSCAN hotspot detection, and intelligent alerting  
- Real-World Problem Solving — Crime data analysis for law enforcement and public safety  
- AI Automation — Automated risk scoring, trend analysis, and anomaly detection  
- User Experience — Modern dashboard with interactive maps, filters, and intuitive UI  
- Scalability and Functionality — Modular FastAPI backend, SQLite database, and responsive Next.js frontend  

---

## Features

- Officer Login — Secure authentication for authorized users  
- Interactive Heatmap — Crime hotspot visualization using Leaflet maps  
- Analytics Dashboard — Trend charts, category distribution, and insights  
- Hotspot Detection — DBSCAN clustering for high-risk zone detection  
- AI Predictions — Forecast crime trends, peak hours, and risk areas  
- Smart Alerts — Automatic detection of crime spikes and anomalies  
- Data Upload — Support for CSV, JSON, Excel, and PDF datasets  
- Location Search — Search any Indian location using OpenStreetMap (Nominatim)  
- Session Management — Secure login/logout with user tracking  

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js, React, TypeScript, Tailwind CSS |
| Backend    | Python, FastAPI, SQLAlchemy |
| Database   | SQLite |
| ML/AI      | scikit-learn (DBSCAN), NumPy, Pandas |
| Charts     | Recharts |
| Maps       | Leaflet / react-leaflet |

---

## Getting Started

### Prerequisites

- Node.js >= 18  
- Python >= 3.10  
- pip (Python package manager)  

---

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/crimsense-ai.git
cd crimsense-ai

# Backend setup
cd backend
pip install -r requirements.txt
cd ..

# Frontend setup
cd frontend
npm install
cd ..
