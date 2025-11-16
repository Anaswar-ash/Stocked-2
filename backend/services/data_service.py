import yfinance as yf
from fastapi import HTTPException

def get_historical_data(ticker: str, period: str = "5y", to_json: bool = False):
    """
    Fetches historical data for a given ticker from Yahoo Finance.

    Args:
        ticker (str): The ticker symbol to fetch data for (e.g., 'AAPL').
        period (str, optional): The period to fetch data for. Defaults to "5y".
        to_json (bool, optional): Whether to return the data as a JSON string. Defaults to False.

    Returns:
        pandas.DataFrame or str: A DataFrame containing the historical data, or a JSON string.
    
    Raises:
        HTTPException: If the ticker is not found or if there is an error fetching the data.
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found or no data available.")
        
        if to_json:
            return hist.to_json(orient='split')
        return hist
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for ticker '{ticker}': {e}")
