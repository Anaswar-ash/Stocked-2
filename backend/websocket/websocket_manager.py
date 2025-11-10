import asyncio
import json
from fastapi import WebSocket
from services.data_service import get_historical_data

class WebSocketManager:
    def __init__(self):
        self.clients: set[WebSocket] = set()

    async def register(self, websocket: WebSocket):
        await websocket.accept()
        self.clients.add(websocket)

    async def unregister(self, websocket: WebSocket):
        self.clients.remove(websocket)

    async def broadcast(self, message: str):
        if self.clients:
            await asyncio.wait([client.send_text(message) for client in self.clients])

    async def producer(self):
        while True:
            try:
                # In a real application, you would fetch real-time data here.
                # For this example, we'll just send a "Hello World" message.
                message = json.dumps({"message": "Hello World"})
                await self.broadcast(message)
                await asyncio.sleep(5)
            except Exception as e:
                print(f"Error in producer: {e}")

    async def handler(self, websocket: WebSocket, path: str = None):
        await self.register(websocket)
        try:
            while True:
                await websocket.receive_text()
        except Exception as e:
            print(f"Error in handler: {e}")
        finally:
            await self.unregister(websocket)

manager = WebSocketManager()
