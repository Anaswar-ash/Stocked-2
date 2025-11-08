from fastapi import FastAPI
from .api import data_api, prediction_api
from .websocket.websocket_manager import manager
import threading
import asyncio

app = FastAPI()

app.include_router(data_api.router)
app.include_router(prediction_api.router)

def run_websocket_server():
    asyncio.run(manager.run())

@app.on_event("startup")
async def startup_event():
    thread = threading.Thread(target=run_websocket_server)
    thread.start()

@app.get("/")
def read_root():
    return {"Hello": "World"}
