const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms = new Map();

wss.on('connection', (ws) => {
  let currentRoom = null;
  let clientId = null;
  let clientName = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'join':
          clientId = message.clientId;
          clientName = message.name || 'Anonymous';
          currentRoom = message.roomId;

          if (!rooms.has(currentRoom)) {
            rooms.set(currentRoom, new Map());
          }

          const room = rooms.get(currentRoom);
          room.set(clientId, { ws, name: clientName });

          const participants = [];
          room.forEach((client, id) => {
            if (id !== clientId) {
              participants.push({ id, name: client.name });
              client.ws.send(JSON.stringify({
                type: 'user-joined',
                clientId,
                name: clientName
              }));
            }
          });

          ws.send(JSON.stringify({
            type: 'joined',
            roomId: currentRoom,
            clientId,
            name: clientName,
            participants
          }));
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          const targetRoom = rooms.get(currentRoom);
          if (targetRoom && targetRoom.has(message.to)) {
            targetRoom.get(message.to).ws.send(JSON.stringify({
              ...message,
              from: clientId,
              fromName: clientName
            }));
          }
          break;

        case 'chat':
          const chatRoom = rooms.get(currentRoom);
          if (chatRoom) {
            chatRoom.forEach((client, id) => {
              if (id !== clientId) {
                client.ws.send(JSON.stringify({
                  type: 'chat',
                  from: clientName,
                  message: message.message,
                  time: new Date().toLocaleTimeString()
                }));
              }
            });
          }
          break;

        case 'update-name':
          const updateRoom = rooms.get(currentRoom);
          if (updateRoom && updateRoom.has(clientId)) {
            const oldName = updateRoom.get(clientId).name;
            updateRoom.get(clientId).name = clientName;
            updateRoom.forEach((client, id) => {
              if (id !== clientId) {
                client.ws.send(JSON.stringify({
                  type: 'user-name-updated',
                  clientId,
                  oldName,
                  newName: clientName
                }));
              }
            });
          }
          break;

        case 'leave':
          handleLeave();
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  function handleLeave() {
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      
      room.forEach((client, id) => {
        if (id !== clientId) {
          client.ws.send(JSON.stringify({
            type: 'user-left',
            clientId
          }));
        }
      });

      room.delete(clientId);
      if (room.size === 0) {
        rooms.delete(currentRoom);
      }
    }
  }

  ws.on('close', () => {
    handleLeave();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 8080;

server.on('request', (req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  }
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
