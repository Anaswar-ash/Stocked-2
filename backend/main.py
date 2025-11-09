from fastapi import FastAPI, WebSocket
import data_api
import prediction_api
from websocket.websocket_manager import manager
import asyncio

app = FastAPI()

app.include_router(data_api.router)
app.include_router(prediction_api.router)

@app.websocket("/ws/aggregate")
async def websocket_endpoint(websocket: WebSocket):
    await manager.handler(websocket, path=None)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(manager.producer())

@app.get("/")
def read_root():
    return {"Hello": "World"}
