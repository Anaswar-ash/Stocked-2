import asyncio
import websockets
import json
from ..services.data_service import get_historical_data

class WebSocketManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WebSocketManager, cls).__new__(cls)
            cls._instance.clients = set()
        return cls._instance

    async def register(self, websocket):
        self.clients.add(websocket)

    async def unregister(self, websocket):
        self.clients.remove(websocket)

    async def broadcast(self, message):
        if self.clients:
            await asyncio.wait([client.send(message) for client in self.clients])

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

    async def handler(self, websocket, path):
        await self.register(websocket)
        try:
            await websocket.wait_closed()
        finally:
            await self.unregister(websocket)

    async def run(self):
        loop = asyncio.get_running_loop()
        loop.create_task(self.producer())
        async with websockets.serve(self.handler, "localhost", 8765):
            await asyncio.Future()  # run forever

manager = WebSocketManager()
