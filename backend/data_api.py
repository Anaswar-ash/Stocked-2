from fastapi import APIRouter, HTTPException
from services.data_service import get_historical_data

router = APIRouter()

@router.get("/data/{ticker}")
def get_data(ticker: str, period: str = "5y"):
    """
    Fetches historical data for a given ticker.
    """
    try:
        return get_historical_data(ticker, period)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
