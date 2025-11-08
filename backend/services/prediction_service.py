import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.models import Sequential
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.arima.model import ARIMA

def create_lstm_model(input_shape):
    """
    This function creates our LSTM model. LSTM stands for Long Short-Term Memory,
    and it's a type of neural network that's really good at understanding sequences
    of data, like time series data (e.g., stock prices).
    """
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=input_shape),
        LSTM(50),
        Dense(25),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

def train_and_predict_with_lstm(data, steps=30):
    """
    This function trains our LSTM model and then uses it to predict future values.
    """
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data['Close'].values.reshape(-1, 1))

    prediction_days = 60
    x_train, y_train = [], []
    for i in range(prediction_days, len(scaled_data)):
        x_train.append(scaled_data[i-prediction_days:i, 0])
        y_train.append(scaled_data[i, 0])

    x_train, y_train = np.array(x_train), np.array(y_train)
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

    model = create_lstm_model(input_shape=(x_train.shape[1], 1))
    model.fit(x_train, y_train, epochs=1, batch_size=1, verbose=0)

    test_inputs = scaled_data[-prediction_days:].reshape(1, -1, 1)
    forecast = []
    current_input = test_inputs

    for _ in range(steps):
        predicted_price = model.predict(current_input)
        forecast.append(predicted_price[0, 0])
        current_input = np.append(current_input[:, 1:, :], [[predicted_price]], axis=1)

    forecast = scaler.inverse_transform(np.array(forecast).reshape(-1, 1))
    return forecast.flatten()

def train_and_predict_with_linear_regression(data, steps=30):
    """
    This function trains a Linear Regression model and makes predictions.
    """
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data['Close'].values.reshape(-1, 1))

    prediction_days = 60
    x_train, y_train = [], []
    for i in range(prediction_days, len(scaled_data)):
        x_train.append(scaled_data[i-prediction_days:i, 0])
        y_train.append(scaled_data[i, 0])

    x_train, y_train = np.array(x_train), np.array(y_train)

    model = LinearRegression()
    model.fit(x_train, y_train)

    test_inputs = scaled_data[-prediction_days:].flatten()
    forecast = []
    current_input = test_inputs

    for _ in range(steps):
        predicted_price = model.predict([current_input])
        forecast.append(predicted_price[0])
        current_input = np.append(current_input[1:], predicted_price)

    forecast = scaler.inverse_transform(np.array(forecast).reshape(-1, 1))
    return forecast.flatten()

def train_and_predict_with_arima(data, steps=30):
    """
    This function trains an ARIMA model and makes predictions.
    """
    history = data['Close'].values
    model = ARIMA(history, order=(5,1,0))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=steps)
    return forecast
