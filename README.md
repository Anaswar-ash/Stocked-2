# Real-Time Financial Dashboard

This web application provides real-time currency and stock exchange data from the UK, US, Hong Kong, and India. The application also features a prediction page that uses advanced machine learning models to forecast future trends.

## Key Features

*   **Real-Time Data:** The application will display real-time currency and stock data from the specified regions.
*   **Prediction Engine:** A dedicated page will allow you to predict future stock and currency prices using models like LSTM and ARIMA.
*   **Bloomberg Terminal UI:** The user interface will be inspired by the iconic Bloomberg terminal, with a minimalist blue and black design and a monospaced font for a professional, data-driven look.

## Technology Stack

*   **Frontend:** React, TypeScript, Recharts
*   **Backend:** Python, FastAPI, yfinance, TensorFlow/Keras, statsmodels
*   **Real-Time Communication:** WebSockets

## Getting Started

### Prerequisites

*   Python 3.9+
*   Node.js 14+

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd finance-dashboard
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd backend
    uvicorn main:app --reload
    ```

2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm start
    ```
