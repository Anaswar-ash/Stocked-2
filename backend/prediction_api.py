from fastapi import APIRouter, HTTPException
from services.data_service import get_historical_data
from services.prediction_service import train_and_predict_with_lstm, train_and_predict_with_linear_regression, train_and_predict_with_arima

router = APIRouter()

@router.post("/predict/{ticker}")
def predict(ticker: str, model_name: str, steps: int = 30):
    """
    Trains a model and makes a prediction.
    """
    try:
        hist = get_historical_data(ticker)
        if model_name == "lstm":
            forecast = train_and_predict_with_lstm(hist, steps)
        elif model_name == "linear_regression":
            forecast = train_and_predict_with_linear_regression(hist, steps)
        elif model_name == "arima":
            forecast = train_and_predict_with_arima(hist, steps)
        else:
            raise HTTPException(status_code=400, detail="Invalid model name.")
        return {"prediction": forecast.tolist()}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
