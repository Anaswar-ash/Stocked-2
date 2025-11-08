const socket = new WebSocket('ws://localhost:8765');

export const connect = (cb: (data: any) => void) => {
  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    cb(data);
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

export const disconnect = () => {
  socket.close();
};
