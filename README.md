# FX-Terminal

FX-Terminal is a Bloomberg-style, minimalist, terminal-font web application for real-time currency and stock exchange data. It provides a platform for viewing real-time data from the UK, US, Hong Kong, and India, and also includes a prediction page which uses LSTM, ARIMA, and other models to predict stock and currency prices.

## What You See

```
┌──────────────────────────────────────────────────────────────┐
│  FX-TERMINAL  v1.0.0                    [🔵]  [⚙]  [👤]  │
├──────────────────────────────────────────────────────────────┤
│  > GBP/USD  1.3045  -0.72 %  │  > USD/INR  88.65  -0.02 %  │
│  > USD/HKD  7.7740  +0.03 %  │  > BTC/USD  96 430  +2.11 % │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   FTSE-100   │  │   S&P 500    │  │ NIFTY 50     │      │
│  │   8 294.2 ▲  │  │ 5 987.3 ▼    │  │ 24 180 ▲     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  > predict GBPUSD 24h                                        │
│  LSTM → 1.3012 ±0.0014  (conf 94 %)                        │
│  ARIMA→ 1.3008 ±0.0021  (conf 91 %)                        │
└──────────────────────────────────────────────────────────────┘
```

## High-Level Architecture

```
                       ┌---------------┐
Browser <--WS-->  Nginx  (TLS, gzip, /api, /ws)  
                       └-----┬---------┘
                             │
         ┌-------------------┴-------------------┐
         │           Kubernetes Pod               │
         │  ┌-------------┐  ┌-------------┐    │
         │  │  Next.js    │  │  FastAPI    │    │
         │  │  (React)    │  │  (Python)   │    │
         │  │  3000       │  │  8000       │    │
         │  └------┬------┘  └------┬------┘    │
         │         │ WS/REST         │ REST      │
         │  ┌------┴------┐  ┌------┴------┐    │
         │  │  Redis      │  │  PostgreSQL │    │
         │  │  (pub/sub)  │  │  (OHLCV)    │    │
         │  └-------------┘  └-------------┘    │
         └---------------------------------------┘
                             │
              ┌--------------┴--------------┐
              │  Background workers (Celery) │
              │  - fetcher.py                │
              │  - predictor.py              │
              └------------------------------┘
```

## Technology Stack

*   **Frontend:** Next.js (React)
*   **Backend:** FastAPI (Python)
*   **Real-Time:** Redis (pub/sub), WebSockets
*   **Database:** PostgreSQL
*   **Async Tasks:** Celery
*   **Proxy:** Nginx
*   **Containerization:** Docker
*   **Orchestration:** Kubernetes
*   **Deployment:** Terraform

## Clone & Run (30 s)

```bash
git clone https://github.com/Anaswar-ash/Stocked-2.git
cd Stocked-2
cp .env.example .env   # add your Twelve-Data key
docker-compose up
```

Open `http://localhost:3000` to see the application.

## Compliance Disclaimer

Data shown is from public Yahoo feed.
Models are educational; no investment advice – *use at your own risk*.
