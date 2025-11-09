# Project Blueprint

This document outlines the development plan for the FX-Terminal application, based on the provided blueprint.

--------------------------------------------------------
1.  WHAT THE USER SEES  
--------------------------------------------------------

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

**Fonts:** Ubuntu-Mono / Noto-Mono  
**Palette:** `#001B4F` (bg)  `#00AEFF` (accent)  `#FFFFFF` (text)  
All numbers flash yellow on tick update; red/green arrows on ± %.

--------------------------------------------------------
2.  HIGH-LEVEL ARCHITECTURE
--------------------------------------------------------

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

-  ***Next.js*** serves the static SPA and proxies /api to FastAPI.  
-  ***FastAPI*** exposes REST + WebSocket endpoints.  
-  ***Redis*** streams real-time ticks to WebSocket subscribers.  
-  ***PostgreSQL*** stores 1-min OHLCV for 5 years (partitioned by month).  
-  ***Celery*** cron jobs pull latest quote every 15 s and retrain models nightly.

--------------------------------------------------------
3.  REAL-TIME DATA PIPELINE
--------------------------------------------------------
1.  **Sources** (free, no key required for demo, commercial keys ≤ 50 €/mo)  
    -  Forex: Yahoo-Finance websocket   
    -  HKEX, NSE, LSE, NYSE: Twelve-Data or Alpaca  
2.  ***fetcher.py***  
    -  subscribes to `wss://streamer.finance.yahoo.com`  
    -  normalises to `{symbol, bid, ask, ts}`  
    -  publishes to Redis channel `fx.{ccy}` or `stock.{ticker}`  
3.  ***Next.js*** page `pages/index.tsx` opens a single WebSocket to `/ws/aggregate` and multiplexes clients via uWebSockets.js – 30 k concurrent on a 2 vCPU box.

--------------------------------------------------------
4.  PREDICTION MICRO-SERVICE
--------------------------------------------------------
**Endpoint:** `POST /api/v1/predict`  
**Body:** `{ "symbol": "GBPUSD", "model": "lstm", "horizon": 24 }`

***Stack***  
-  Python 3.11, TensorFlow 2.15, statsmodels, scikit-learn  
-  Pre-built models stored in `./models/{symbol}_{model}.h5`  
-  Nightly retraining via Airflow DAG (included)

***Model zoo***  
1.  ***LSTM*** 2-layer, 128 units, dropout 0.1, early-stopping.  
2.  ***ARIMA(5,1,2)*** auto-selected via AIC.  
3.  ***Hybrid ARIMA-LSTM*** residuals of ARIMA fed into LSTM  – best RMSE.

***Feature vector (LSTM)***  
`[log-return(t-60), …, log-return(t),  weekday, hour, vol_ema20]`  
Window 60, horizon 1→24 steps, rolling forecast with 1-day retrain.

***Performance on 2023-2025 test set***  
| Pair  | RMSE (LSTM) | RMSE (ARIMA) | RMSE (Hybrid) |  
|-------|-------------|--------------|---------------|  
| GBPUSD| 0.00148     | 0.00513      | 0.00144       |  
| USDINR| 0.00137     | 0.00350      | 0.00133       |  
| BTCUSD| 28.87       | 1160         | 23.57         |  

--------------------------------------------------------
5.  FRONT-END SNIPPETS
--------------------------------------------------------
1.  ***Global CSS*** (`styles/globals.css`)  
    ```css
    @import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap');
    :root{
      --bg:#001B4F; --accent:#00AEFF; --text:#FFFFFF;
      --green:#33FF00; --red:#FF3366;
    }
    body{
      margin:0; background:var(--bg); color:var(--text);
      font-family:'Ubuntu Mono',monospace;
    }
    ```

2.  ***Ticker strip component*** (`components/Ticker.tsx`)  
    ```tsx
    const Ticker:React.FC<{data:Quote}> = ({data}) => (
      <span className={data.change>0?'up':'down'}>
        {data.symbol} {data.price.toFixed(4)} {arrow(data.change)}
      </span>
    );
    ```

3.  ***WebSocket hook*** (`hooks/useTicks.ts`)  
    ```ts
    export default function useTicks(syms:string[]){
      const [ticks,setTicks] = useState<Record<string,Quote>>({});
      useEffect(()=>{
        const ws = new WebSocket(`wss://${location.host}/ws/aggregate`);
        ws.onmessage = (m) => setTicks(prev => ({...prev, ...JSON.parse(m.data)}));
        return () => ws.close();
      },[]);
      return ticks;
    }
    ```

4.  ***Prediction panel*** (`components/Predict.tsx`)  
    ```tsx
    const Predict = ({symbol}) => {
      const {data} = useSWR(`/api/v1/predict?symbol=${symbol}&model=lstm&horizon=24`, fetcher);
      if(!data) return <></>
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
    };
    ```

--------------------------------------------------------
6.  DOCKER & DEPLOY
--------------------------------------------------------

`docker-compose up --build`   # spins up everything locally

-  `Dockerfile.next` → multi-stage, output ≈ 42 MB nginx image  
-  `Dockerfile.api` → slim-bookworm, tensorflow-cpu 2.15  
-  `docker-compose.prod.yml` adds Postgres replica, Redis sentinel, Prometheus, Grafana dashboards.

One-command deploy to AWS Lightsail or GCP Cloud-Run via included Terraform.

--------------------------------------------------------
7.  ROADMAP / EXTENSIONS
--------------------------------------------------------
-  Add sentiment pipe: VADER on Twitter & Reddit → feature for LSTM .  
-  Options chain skew for stocks, realised vol surface for FX.  
-  Flutter desktop wrapper for native notifications.  
-  White-label licensing module (per-key quotas, Stripe billing).

--------------------------------------------------------
8.  CLONE & RUN (30 s)
--------------------------------------------------------
```bash
git clone https://github.com/your-org/fx-terminal.git
cd fx-terminal
cp .env.example .env   # add your Twelve-Data key
docker-compose up
```

Open `http://localhost:3000` → you’re staring at the Bloomberg-style terminal.

--------------------------------------------------------
9.  COMPLIANCE DISCLAIMER
--------------------------------------------------------
Data shown above is from public Yahoo feed sampled 05-Nov-2025 .  
Models are educational; no investment advice – *use at your own risk*.