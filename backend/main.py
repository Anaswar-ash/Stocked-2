from fastapi import FastAPI
from .api import data_api

app = FastAPI()

app.include_router(data_api.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
