import yfinance as yf
from fastapi import HTTPException

def get_historical_data(ticker: str, period: str = "5y"):
    """
    Fetches historical data for a given ticker from Yahoo Finance.

    Args:
        ticker (str): The ticker symbol to fetch data for (e.g., 'AAPL').
        period (str, optional): The period to fetch data for. Defaults to "5y".

    Returns:
        pandas.DataFrame: A DataFrame containing the historical data.
    
    Raises:
        HTTPException: If the ticker is not found or if there is an error fetching the data.
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found or no data available.")
        return hist
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for ticker '{ticker}': {e}")
