const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    console.log(`Room created: ${roomId}`);
  });

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
    socket.to(roomId).emit('user-joined', userId);
  });

  socket.on('send-offer', (roomId, offer) => {
    socket.to(roomId).emit('receive-offer', offer);
  });

  socket.on('send-answer', (roomId, answer) => {
    socket.to(roomId).emit('receive-answer', answer);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(3001, () => {
  console.log('Socket.IO server running on http://localhost:3001');
});
