from fastapi import FastAPI
from .api import data_api, prediction_api

app = FastAPI()

app.include_router(data_api.router)
app.include_router(prediction_api.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
