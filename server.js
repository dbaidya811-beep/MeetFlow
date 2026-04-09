const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();

function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

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
                from: clientId
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
              clientName = message.name;
              updateRoom.get(clientId).name = clientName;
              updateRoom.forEach((client, id) => {
                if (id !== clientId) {
                  client.ws.send(JSON.stringify({
                    type: 'user-name-updated',
                    clientId,
                    newName: clientName
                  }));
                }
              });
            }
            break;

          case 'leave':
            if (currentRoom && rooms.has(currentRoom)) {
              const leaveroom = rooms.get(currentRoom);
              if (leaveroom.has(clientId)) {
                leaveroom.delete(clientId);
                leaveroom.forEach((client) => {
                  client.ws.send(JSON.stringify({
                    type: 'user-left',
                    clientId
                  }));
                });
              }
            }
            break;
        }
      } catch (e) {
        console.error('Message error:', e);
      }
    });

    ws.on('close', () => {
      if (currentRoom && rooms.has(currentRoom)) {
        const leaveroom = rooms.get(currentRoom);
        if (leaveroom.has(clientId)) {
          leaveroom.delete(clientId);
          leaveroom.forEach((client) => {
            client.ws.send(JSON.stringify({
              type: 'user-left',
              clientId
            }));
          });
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  setupWebSocketServer(server);

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}`);
  });
});